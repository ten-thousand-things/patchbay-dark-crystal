const pull = require('pull-stream')
const { h, Array: MutantArray, map, throttle } = require('mutant')

function DarkCrystalIndex (opts) {
  const {
    scuttle,
    onClick = console.log
  } = opts

  const roots = getRoots()
  return h('DarkCrystalIndex', [
    map(roots, Root, { comparer })
  ])

  function Root (msg) {
    return h('div.crystal', { 'ev-click': () => onClick(msg) }, [
      h('div.name', msg.value.content.name),
      h('div.started', new Date(msg.value.timestamp).toLocaleDateString())
    ])
  }

  function getRoots () {
    const store = MutantArray([])
    pull(
      scuttle.pull.roots({ live: true }),
      pull.filter(m => !m.sync),
      pull.drain(root => store.insert(root, 0))
    )
    return throttle(store, 100)
  }
}

function comparer (a, b) {
  return a && b && a.key === b.key
}

module.exports = DarkCrystalIndex
