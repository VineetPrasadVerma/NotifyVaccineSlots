const axios = require('axios')
const moment = require('moment')

const getCenters = async (districtId, date) => {
    try {
        const resp = await axios.get(`https://cdn-api.co-vin.in/api/v2/appointment/sessions/public/calendarByDistrict?district_id=${districtId}&date=${date}`, {
            headers: {
                'user-agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/90.0.4430.93 Safari/537.36'
            }
        });
        return resp.data.centers
    } catch (e) {
        console.log('Error', e,)
    }
}

async function getFilteredCenters() {
    const centers = await getCenters('313', moment().format('DD-MM-YYYY'))
    const filteredCenters = centers.filter(center => {
        const sessions = center.sessions
        for (const session of sessions) {
            if (session.available_capacity > 0 && session.min_age_limit === 18) return true
        }
    })

    console.log(filteredCenters)

}

getFilteredCenters()

