const { h, when, computed } = require('mutant')
const getContent = require('ssb-msg-content')

const ProgressBar = require('../component/progress')

module.exports = function DarkCrystalRitualShow ({ ritual, shardRecords }) {
  return computed([ritual, shardRecords], (ritual, records) => {
    if (!ritual) return

    const { quorum } = getContent(ritual)
    const hasRequests = records.some(r => r.requests.length > 0)
    const recordsWithReplies = records.filter(r => r.replies.length > 0)
    const quorumMet = recordsWithReplies.length >= quorum
    
    return h('section.ritual', [
      h('div.quorum', [
        h('span', 'Quorum required: '),
        h('strong', quorum)
      ]),
      when(hasRequests,
        ProgressBar({
          prepend: h('h3', 'Progress'),
          maximum: records.length,
          middle: quorum,
          title: 'Replies:',
          records: recordsWithReplies
        })
      ),
      when(quorumMet,
        h('div.recombine', [
          h('span', 'Quorum reached!')
        ])
      )
    ])
  })
}
