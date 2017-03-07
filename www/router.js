window.onhashchange = (event) => {
    document.body.innerHTML = ''

    const [hash,...paths] = location.hash.split('/')
    
    switch(hash) {
        case '#home':
            const homeView = new app.HomeView()
            document.body.appendChild(homeView.render())
            break
        case '#circle':
            const circleView = new app.CircleView()
            document.body.appendChild(circleView.render())
            break
    }
}  
