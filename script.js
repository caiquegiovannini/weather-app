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

async function getTwelveHoursForecast() {
    let results = await getLocation(city.value)
    const locationKey = results[0].Key

    results = await fetch(`${apiUrl}/forecasts/v1/hourly/12hour/${locationKey}?apikey=${appId}&language=pt-BR&metric=true`)
    return results.json()
}

async function getFiveDaysForecast() {
    let results = await getLocation(city.value)
    const locationKey = results[0].Key

    results = await fetch(`${apiUrl}/forecasts/v1/daily/5day/${locationKey}?apikey=${appId}&language=pt-BR&metric=true`)
    return results.json()
}

function getWeekDay(date) {
    const weekDays = ['Domingo', 'Segunda', 'Terça', 'Quarta', 'Quinta', 'Sexta', 'Sábado']
    const day = new Date(date)
    const weekDay = weekDays[day.getUTCDay()]

    return weekDay
}

function displayWeatherImage(iconNumber, weatherText) {
    const mainIcon = document.querySelector('main .temp img')

    mainIcon.src = `https://www.accuweather.com/images/weathericons/${iconNumber}.svg`
    mainIcon.alt = `${weatherText} icon`
}

function displayCurrentWeather(data) {
    const { city, admAreaId } = data.location
    
    displayWeatherImage(data.iconNumber, data.condition)
    
    document.querySelector('.temp .degrees h1').innerHTML = `${data.degrees}º`
    document.querySelector('.temp .degrees p').innerHTML = `${city}, ${admAreaId}`
    document.querySelector('#wind .info p').innerHTML = `${data.wind}km/h`
    document.querySelector('#humidity .info p').innerHTML = `${data.humidity}%`
    document.querySelector('#visibility .info p').innerHTML = `${data.visibility}km`
    document.querySelector('#uvIndex .info p').innerHTML = `${data.uvIndex}`
}

function displayHoursForecast(data) {
    const hours = document.querySelector('.today .card .content .next-hours')
    hours.innerHTML = ''

    for (let i = 0; i < 7; i++) {
        const hourDiv = document.createElement('div')
        hourDiv.classList.add('hour')

        const date = new Date(data.nextHours[i].DateTime)
        const hour = document.createElement('h3')
        hour.innerHTML = `${date.getHours()}`

        const icon = new Image() 
        icon.src = `images/icons/${data.nextHours[i].WeatherIcon}.png`
        icon.alt = `${data.nextHours[i].IconPhrase} icon`

        const desc = document.createElement('p')
        desc.innerHTML = `${data.nextHours[i].IconPhrase}`

        const temp = document.createElement('h2')
        temp.innerHTML = `${Math.round(data.nextHours[i].Temperature.Value)}º`

        hourDiv.appendChild(hour)
        hourDiv.appendChild(icon)
        hourDiv.appendChild(desc)
        hourDiv.appendChild(temp)
        hours.appendChild(hourDiv)
    }
}

function displayDaysForecast(data) {
    const days = document.querySelector('.forward-days .card .days')
    days.innerHTML = ''

    for(let i = 1; i < 5; i++) {
        const dayDiv = document.createElement('div')
        dayDiv.classList.add('day')

        const weekDay = getWeekDay(data.nextDays[i].Date)
        const day = document.createElement('h3')
        day.innerHTML = `${weekDay}`

        const div = document.createElement('div')
        const icon = new Image()
        const desc = document.createElement('p')
        icon.src = `images/icons/${data.nextDays[i].Day.Icon}.png`
        icon.alt = `${data.nextDays[i].Day.IconPhrase} icon`
        desc.innerHTML = `${data.nextDays[i].Day.IconPhrase}`
        div.appendChild(icon)
        div.appendChild(desc)

        const temp = document.createElement('h2')
        temp.innerHTML = `
            ${Math.round(data.nextDays[i].Temperature.Minimum.Value)}º/
            ${Math.round(data.nextDays[i].Temperature.Maximum.Value)}º
        `
        dayDiv.appendChild(day)
        dayDiv.appendChild(div)
        dayDiv.appendChild(temp)
        days.appendChild(dayDiv)
    }
}

displayGreetings()

document.querySelector('.searchForm').addEventListener('submit', async e => {
    e.preventDefault()
    
    const weather = await getCurrentWeather()
    const nextHours = await getTwelveHoursForecast()
    const nextDays = await getFiveDaysForecast()
    
    document.querySelector('main .now').classList.add('displayed')

    data = {
        ...data,
        condition: weather[0].WeatherText.toLowerCase(),
        iconNumber: weather[0].WeatherIcon,
        degrees: Math.round(weather[0].Temperature.Metric.Value),
        wind: Math.round(weather[0].Wind.Speed.Metric.Value),
        humidity: weather[0].RelativeHumidity,
        visibility: Math.round(weather[0].Visibility.Metric.Value),
        uvIndex: `${weather[0].UVIndex} ${weather[0].UVIndexText}`,
        nextHours,
        nextDays: nextDays.DailyForecasts
    }

    displayCurrentWeather(data)
    displayHoursForecast(data)
    displayDaysForecast(data)

    document.querySelector('header div p').innerHTML = `O tempo lá fora está ${data.condition}`

    console.log(data.nextDays)
})
