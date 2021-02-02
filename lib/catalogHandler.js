const consts = require('./consts')

async function catalogHandler(storage, metaStorage) {
	const metas = []

	storage.indexes.itemId.forEach((items, itemId) => {
		const entry = storage.getAggrEntry('itemId', itemId, ['files'])
		if (!(entry.itemId && entry.files && entry.files.length))
			return { metas }

		const firstFile = entry.files[0]
		
		// @TODO: should we assert that itemId begins with the supported prefixes?
		const meta = metaStorage.indexes.primaryKey.get(entry.itemId)
		metas.push(meta || {
			id: entry.itemId,
			type: 'other',
			name: firstFile.parsedName || entry.name,
			poster: firstFile.imdb_id ? consts.METAHUB_URL+'/poster/medium/'+firstFile.imdb_id+'/img' : null,
		})
	})

	return { metas }
}

module.exports = catalogHandler