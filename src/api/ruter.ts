const ENTUR_API = 'https://api.entur.io/journey-planner/v3/graphql'
const CLIENT_NAME = 'wall-display-homelab'

export interface Departure {
  id: string
  line: string
  lineColor: string
  lineTextColor: string
  destination: string
  expectedDepartureTime: string
  aimedDepartureTime: string
  realtime: boolean
  direction: 'inbound' | 'outbound'
}

interface EnturCall {
  expectedDepartureTime: string
  aimedDepartureTime: string
  realtime: boolean
  destinationDisplay: { frontText: string }
  serviceJourney: {
    id: string
    journeyPattern: {
      directionType: 'inbound' | 'outbound'
      line: {
        publicCode: string
        presentation: { colour: string; textColour: string }
      }
    }
  }
}

interface EnturResponse {
  data: {
    stopPlace: {
      estimatedCalls: EnturCall[]
    }
  }
}

const QUERY = (stopId: string, count: number) => `
  {
    stopPlace(id: "${stopId}") {
      estimatedCalls(timeRange: 7200, numberOfDepartures: ${count}) {
        expectedDepartureTime
        aimedDepartureTime
        realtime
        destinationDisplay { frontText }
        serviceJourney {
          id
          journeyPattern {
            directionType
            line {
              publicCode
              presentation { colour textColour }
            }
          }
        }
      }
    }
  }
`

export async function fetchDepartures(stopId: string, count = 30): Promise<Departure[]> {
  const res = await fetch(ENTUR_API, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'ET-Client-Name': CLIENT_NAME,
    },
    body: JSON.stringify({ query: QUERY(stopId, count) }),
  })

  if (!res.ok) throw new Error(`EnTur API ${res.status}`)

  const json = (await res.json()) as EnturResponse

  return json.data.stopPlace.estimatedCalls.map((call) => ({
    // serviceJourney.id alone is not unique — same train can appear twice at a stop (loop routes).
    // aimedDepartureTime is stable and makes the composite unique per departure.
    id: `${call.serviceJourney.id}:${call.aimedDepartureTime}`,
    line: call.serviceJourney.journeyPattern.line.publicCode,
    lineColor: `#${call.serviceJourney.journeyPattern.line.presentation.colour}`,
    lineTextColor: `#${call.serviceJourney.journeyPattern.line.presentation.textColour}`,
    destination: call.destinationDisplay.frontText,
    expectedDepartureTime: call.expectedDepartureTime,
    aimedDepartureTime: call.aimedDepartureTime,
    realtime: call.realtime,
    direction: call.serviceJourney.journeyPattern.directionType,
  }))
}
