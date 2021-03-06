const { h, Struct, Value, Array: MutantArray, computed, when, watch, resolve } = require('mutant')
const Recipients = require('./component/recipients')
const Errors = require('./component/errors')

const MIN_RECPS = 2

function DarkCrystalNew (opts) {
  const {
    scuttle,
    suggest,
    avatar,
    afterRitual = console.log,
    onCancel = console.log
  } = opts

  const initialState = {
    crystalName: '',
    secret: '',
    recps: MutantArray([]),
    quorum: undefined,
    showErrors: false,
    performingRitual: false
  }
  const state = Struct(initialState)

  const errors = Struct({
    validation: computed(state, checkForErrors),
    ritual: Value()
  })
  watch(errors.validation, errors => {
    if (!Object.keys(errors).length) state.showErrors.set(false)
  })

  return h('DarkCrystalNew', [
    h('h1', 'New Dark Crystal'),
    h('section.inputs', [
      h('div.name', [
        h('label.name', 'Name'),
        h('input.name', {
          placeholder: 'name this crystal',
          value: state.crystalName,
          'ev-input': ev => state.crystalName.set(ev.target.value)
        })
      ]),
      h('div.secret', [
        h('label', 'Secret'),
        h('textarea', {
          placeholder: 'your secret',
          value: state.secret,
          'ev-input': ev => state.secret.set(ev.target.value)
        })
      ]),
      h('div.recps', [
        h('label.recps', 'Custodians'),
        Recipients({ state, suggest, avatar })
      ]),
      h('div.quorum', [
        h('label.quorum', 'Quorum'),
        h('input.quorum', {
          type: 'number',
          min: MIN_RECPS,
          steps: 1,
          value: state.quorum,
          placeholder: 'number of shards recover',
          'ev-input': ev => state.quorum.set(Number(ev.target.value) || undefined)
        })
      ])
    ]),
    h('section.actions', when(state.performingRitual,
      h('i.fa.fa-spinner.fa-pulse'),
      [
        h('button -subtle', { 'ev-click': () => { state.set(initialState); onCancel() } }, 'Cancel'),
        when(errors.validation,
          h('button -subtle', { 'ev-click': () => state.showErrors.set(true) }, 'Perform Ritual'),
          h('button -primary', { 'ev-click': () => performRitual(state) }, 'Perform Ritual')
        )
      ]
    )),
    when(state.showErrors,
      h('section.errors.-validation', [
        h('div.spacer'),
        Errors('The ritual ingredients need tuning:', errors.validation)
      ])
    ),
    when(errors.ritual,
      h('section.errors.-ritual', [
        h('div.spacer'),
        Errors('Something went wrong with the ritual', errors.ritual)
      ])
    )
  ])

  function performRitual (state) {
    const { crystalName: name, secret, recps, quorum } = resolve(state)

    state.performingRitual.set(true)

    scuttle.share.async.share({ name, secret, recps, quorum }, (err, data) => {
      if (err) {
        state.performingRitual.set(false)
        errors.ritual.set(err)
        return
      }

      afterRitual(err, data)
      state.set(initialState)
    })
  }
}

function checkForErrors ({ crystalName, secret, recps, quorum }) {
  const err = {}
  if (!crystalName) err.name = 'required'
  if (!secret) err.secret = 'required'
  if (secret.length > 1350) err.secret = 'your secret must be shorter'
  if (recps.length < MIN_RECPS) err.custodians = `you need to offer at least ${MIN_RECPS}`
  if (recps.length < quorum) err.quorum = 'you need more custodians, or a lower quorum.'
  if (quorum !== Math.floor(quorum)) err.quorum = 'must be a whole number' // will over-write the above message

  if (Object.keys(err).length) return err
  else return false
}

module.exports = DarkCrystalNew
