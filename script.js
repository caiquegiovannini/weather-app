const appId = 'i7bbgAh4cKqpOJG4oyDzFG0r6vqCACE0'
const apiUrl = 'https://dataservice.accuweather.com'
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
    const results = await fetch(`${apiUrl}/locations/v1/cities/search?apikey=${appId}&q=${cityName}`)

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

    results = await fetch(`${apiUrl}/currentconditions/v1/${locationKey}?apikey=${appId}&language=pt-BR&details=true`)
    return results.json()
}

function displayWeatherImage(iconNumber, weatherText) {
    const mainIcon = document.querySelector('main .temp img')

    mainIcon.src = `https://www.accuweather.com/images/weathericons/${iconNumber}.svg`
    mainIcon.alt = `${weatherText} icon`
}

function displayCurrentWeather(degrees, location, wind, humidity, visibility, uvIndex) {
    const { city, admAreaId } = location
    document.querySelector('.temp .degrees h1').innerHTML = `${degrees}º`
    document.querySelector('.temp .degrees p').innerHTML = `${city}, ${admAreaId}`
    document.querySelector('#wind .info p').innerHTML = `${wind}km/h`
    document.querySelector('#humidity .info p').innerHTML = `${humidity}%`
    document.querySelector('#visibility .info p').innerHTML = `${visibility}km`
    document.querySelector('#uvIndex .info p').innerHTML = `${uvIndex}`
}

displayGreetings()

document.querySelector('.searchForm').addEventListener('submit', async e => {
    e.preventDefault()

    const weather = await getCurrentWeather()

    document.querySelector('main .now').classList.add('displayed')

    data = {
        ...data,
        condition: weather[0].WeatherText.toLowerCase(),
        iconNumber: weather[0].WeatherIcon,
        degrees: Math.round(weather[0].Temperature.Metric.Value),
        wind: Math.round(weather[0].Wind.Speed.Metric.Value),
        humidity: weather[0].RelativeHumidity,
        visibility: Math.round(weather[0].Visibility.Metric.Value),
        uvIndex: `${weather[0].UVIndex} ${weather[0].UVIndexText}`
    }

    displayWeatherImage(data.iconNumber, data.condition)

    displayCurrentWeather(data.degrees, data.location, data.wind, data.humidity, data.visibility, data.uvIndex)

    document.querySelector('header div p').innerHTML = `O tempo lá fora está ${data.condition}`



    console.log(data)
    console.log(weather)
})
