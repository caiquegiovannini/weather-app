const appId = 'i7bbgAh4cKqpOJG4oyDzFG0r6vqCACE0'
const city = document.querySelector('.searchForm input')
let data = {}

function displayGreetings() {
    const hour = new Date().getHours()
    const greetings = ['Bom dia!', 'Boa tarde!', 'Boa noite!']
    let greeting = document.querySelector('header div h3')

    if (hour >= 6 && hour < 12) {
        greeting.innerHTML = greetings[0]
    } else if (hour >= 12 && hour < 18) {
        greeting.innerHTML = greetings[1]
    } else {
        greeting.innerHTML = greetings[2]
    }

}

async function getLocation(cityName) {
    const results = await fetch(`https://dataservice.accuweather.com/locations/v1/cities/search?apikey=${appId}&q=${cityName}`)
    return results.json()
}

async function getCurrentWeather() {
    let results = await getLocation(city.value)
    const locationKey = results[0].Key
    data = { 
        ...data, 
        location: {
            city: results[0].LocalizedName,
            admAreaId: results[0].AdministrativeArea.ID
        }
    }

    results = await fetch(`https://dataservice.accuweather.com/currentconditions/v1/${locationKey}?apikey=${appId}&language=pt-BR`)
    return results.json()
}

function displayWeatherImage(iconNumber, weatherText) {
    const mainIcon = document.querySelector('main .temp img')

    mainIcon.src = `https://www.accuweather.com/images/weathericons/${iconNumber}.svg`
    mainIcon.alt = `${weatherText} icon`
}

function displayCurrentWeather(degrees, location) {
    const { city, admAreaId } = location
    document.querySelector('.temp .degrees h1').innerHTML = degrees
    document.querySelector('.temp .degrees p').innerHTML = `${city}, ${admAreaId}`
}

displayGreetings()

document.querySelector('.searchForm').addEventListener('submit', async e => {
    e.preventDefault()

    document.querySelector('main .temp').classList.add('displayed')

    const weather = await getCurrentWeather()

    data = {
        ...data,
        condition: weather[0].WeatherText.toLowerCase(),
        iconNumber: weather[0].WeatherIcon,
        degrees: Math.round(weather[0].Temperature.Metric.Value),
    }

    displayWeatherImage(data.iconNumber, data.condition)

    displayCurrentWeather(data.degrees, data.location)

    document.querySelector('header div p').innerHTML = `O tempo lá fora está ${data.condition}`



    console.log(data)
})
