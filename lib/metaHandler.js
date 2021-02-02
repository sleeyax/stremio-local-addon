const fetch = require('node-fetch')

const indexer = require('./indexer')
const mapEntryToMeta = require('./mapEntryToMeta')
const consts = require('./consts')

async function metaHandler(storage, metaStorage, engineUrl, args) {
	let entryPromise = storage.getAggrEntry('itemId', args.id, ['files'])

	if(!entryPromise && args.id.startsWith(consts.PREFIX_BT))
		entryPromise = getNonIndexedTorrent(engineUrl, args.id.slice(consts.PREFIX_BT.length))
	
	if(!entryPromise) return { meta: {} }
	
	try {
		const entry = await entryPromise
		const videos = entry.files.sort((a, b) => {
			// If we have season and episode, sort videos; otherwise retain the order
			try {
				const season = a.season - b.season;
				return season ? season : a.episode[0] - b.episode[0];
			} catch(e) {
				return 0;
			}
		}).map(mapFile.bind(null, entry, new Date().getTime())) 
		const meta = metaStorage.indexes.primaryKey.get(entry.itemId) || mapEntryToMeta(entry)
		meta.videos = videos
		return { meta }
	} catch(err) {
		console.error(err)
		return { meta: {} }
	}
}

async function getNonIndexedTorrent(engineUrl, ih) {
	const response = await fetch(`${engineUrl}/${ih}/create`, { method: 'POST' })
	const torrent = await response.json()
	return new Promise((resolve, reject) => {
		// torrent.announce = (torrent.sources || []).map(function(source) {
		// 	return source.url.startsWith('tracker:') ? source.url.substr(8) : source.url
		// })
		indexer.indexParsedTorrent(torrent, (err, entry) => {
			if (err) return reject(err)
			if (!entry) return reject(new Error('internal err: no entry from indexParsedTorrent'))
			resolve(entry)
		})
	})
}

function mapFile(entry, uxTime, file, index) {
	const stream = entry.ih ? {
		infoHash: entry.ih,
		fileIdx: file.idx,
		id: 'bt:' + entry.ih + '/' + file.idx,
		sources: entry.sources
	} : {
		id: 'file://'+file.path,
		url: 'file://'+file.path,
		subtitle: consts.STREAM_LOCALFILE_SUBTITLE,
	}

	return {
		id: stream.id,
		// We used to have a thumbnail here.
		// This caused downloading of all episodes in order to be generated a preview.
		title: file.name,
		publishedAt: entry.dateModified || new Date(),
		// The videos in the UI are sorted by release date. Newest at top.
		// For local files we want oldest at top
		released: new Date(uxTime - index * 60000),
		stream: stream,
	}
}

module.exports = metaHandler