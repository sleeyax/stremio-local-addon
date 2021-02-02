const tape = require('tape')
const AddonClient = require('stremio-addon-client')

const addonUrl = 'http://127.0.0.1:1222/manifest.json'
const testIh = '7782ab24188091eae3f61fd218b2dffb4bf9cf9c'
const testIhRecoginzed = '07a9de9750158471c3302e4e95edb1107f980fa6'

let addon

tape('initialize add-on', (t) => {
	return AddonClient.detectFromURL(addonUrl)
	.then((resp) => {
		t.ok(resp, 'has response')
		t.ok(resp.addon, 'has addon')
		t.ok(resp.addon.manifest.catalogs, 'has catalogs')
		t.ok(resp.addon.manifest.catalogs.length, 'has catalogs length')
		const resource = resp.addon.manifest.resources.find(r => r.name === 'meta')
		t.ok(resource.idPrefixes.includes('bt:'), 'idPrefixes has bt:')
		t.ok(resource.idPrefixes.includes('local:'), 'idPrefixes has local:')

		addon = resp.addon

		t.end()
	})
	.catch((e) => { 
		t.error(e)
		t.end()
	})

})

tape('catalog', (t) => {
	addon.get('catalog', addon.manifest.catalogs[0].type, addon.manifest.catalogs[0].id)
	.then((resp) => {
		t.ok(Array.isArray(resp.metas), 'resp has metas')
		t.end()
	})
	.catch((e) => { 
		t.error(e)
		t.end()
	})
})

tape('meta - bittorrent', (t) => {
	addon.get('meta', 'other', 'bt:'+testIh)		
	.then((resp) => {
		t.ok(resp.meta, 'has meta')
		t.equals(resp.meta.id, 'bt:'+testIh, 'id is correct')
		t.ok(Array.isArray(resp.meta.videos), 'has videos')

		resp.meta.videos.forEach((vid) => {
			t.ok(vid.stream, 'video has stream')
		})
		t.end()
	})
	.catch((e) => {
		t.error(e)
		t.end()
	})
})


tape('meta - bittorrent - recognized item', (t) => {
	addon.get('meta', 'other', 'bt:'+testIhRecoginzed)		
	.then((resp) => {
		t.ok(resp.meta, 'has meta')
		t.equals(resp.meta.type, 'other', 'recognized as other')
		t.equals(resp.meta.imdb_id, 'tt1748166', 'recognized as pioneer one')
		t.equals(resp.meta.name, 'Pioneer One')
		t.ok(Array.isArray(resp.meta.videos), 'has videos')

		t.end()
	})
	.catch((e) => {
		t.error(e)
		t.end()
	})
})


// @TODO: stream resource test
