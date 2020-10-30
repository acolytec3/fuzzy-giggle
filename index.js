'use strict'

const IPFS = require('ipfs')
const eventstore = require('orbit-db-eventstore')
const orbitdb = require('orbit-db')

async function main() {

  const node = await IPFS.create(
    {
      relay: { enabled: true, hop: { enabled: true, active: true } },
      EXPERIMENTAL: { pubsub: true },
      config: {
        Addresses: {
          Swarm: ["/dns4/wrtc-star1.par.dwebops.pub/tcp/443/wss/p2p-webrtc-star/",
            "/dns4/wrtc-star2.sjc.dwebops.pub/tcp/443/wss/p2p-webrtc-star/",
                "/ip4/0.0.0.0/tcp/4002",
                "/ip4/0.0.0.0/tcp/4003/ws"
              ],
        },
        Discovery: {
          webRTCStar: { enabled: true}
        }
      }
    })


    let orbit = await orbitdb.createInstance(node)

    let dbAddr = await orbit.determineAddress('safeguard', 'eventlog', { accessController: { write: ['*'] } })
    console.log('address is', dbAddr)
    let events
    if (dbAddr) {
      events = (await orbit.open(dbAddr))
      console.log('found Db!', events)
    }
    else
      events = await orbit.eventlog('safeguard', {})
    await events.load()
    events.events.on('replicate', (addr) => console.log('Replicating DB to ', addr))
    events.events.on('peer', (peer) => console.log('Found a peer with our DB', peer))
    console.log('Orbit DB initiated')
    console.log('please commit')
}

main()