const { h, Value, when } = require('mutant')

module.exports = function DarkCrystalRequestNew ({ root, scuttle, modal, recipients = null }, callback) {
  // if recipients is null, then all shard holders get a request!
  const rootId = root.key
  const requesting = Value(false)
  const warningOpen = Value(false)

  return h('div.request', [
    h('button -primary',
      { 'ev-click': (e) => warningOpen.set(true) },
      when(requesting,
        h('i.fa.fa-spinner.fa-pulse'),
        'Request'
      )
    ),
    warningModal()
  ])

  function warningModal () {
    return modal(
      h('div.warning', [
        h('span', 'Are you sure?'),
        h('button -subtle', { 'ev-click': () => warningOpen.set(false) }, 'Cancel'),
        h('button -subtle', { 'ev-click': sendRequest }, 'OK')
      ]), { isOpen: warningOpen }
    )
  }

  function sendRequest () {
    warningOpen.set(false)
    requesting.set(true)

    scuttle.recover.async.request(rootId, recipients, (err, requests) => {
      requesting.set(false)
      if (err) return callback(err)

      callback(null, requests)
    })
  }
}
