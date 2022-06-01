

const request_api = {
    options: {
        method: 'GET',
	    headers: {
		    'X-RapidAPI-Host': 'free-to-play-games-database.p.rapidapi.com',
		    'X-RapidAPI-Key': '64e5d9c68emsh19bbeb4a0465c43p1b5b03jsn4f43aa258c64'
	    }
    },

    fn_validate_url(){
        let url = 'https://free-to-play-games-database.p.rapidapi.com/api/'
    
        let platform = filtersForFetch.platform.length;
        let categorys = filtersForFetch.category.length; 
    
        if (platform === 0 && categorys === 0){
            url += 'games' 
            return url
        }else if (platform === 0 && categorys === 1) { // Simple category
            url += `games?category=${filtersForFetch.category[0]}`
            return url
        }else if (platform > 1 && categorys === 0) { //Simple platform
            url += `games?platform=${filtersForFetch.platform}`
            return url
        }else if (platform === 0 && categorys > 1){
            url += `filter?tag=${filtersForFetch.category.join(".")}`
            return url
        }else if (platform > 1 && categorys === 1) {
            url += `games?platform=${filtersForFetch.platform}&category=${filtersForFetch.category[0]}`
            return url
        }else if (platform > 1 && categorys > 1){
            url += `filter?tag=${filtersForFetch.category.join(".")}&platform=${filtersForFetch.platform}`
            return url 
        }
    },

    async fetch_initial(){
        global_vars.fetch_results = []

        let url = 'https://free-to-play-games-database.p.rapidapi.com/api/games?sort-by=popularity'
        const data_api = await fetch(url, this.options).then((resp) => resp.json())

        if (data_api.length > 0) {
            DOM_HTML.render_banner(data_api.shift())
            global_vars.fetch_results = data_api
            DOM_HTML.render_items();
            fn_storage.fnHandleCurrentGames()
        }
    },
    async fetch_filtered(){
        global_vars.fetch_results = []

        if (document.querySelector('.content .container button')) {
            document.querySelector('.content .container button').remove()
        }

        DOM_HTML.remove_childrens(global_vars.game_banner)
        DOM_HTML.remove_childrens(global_vars.grid_all_games)
        
        const url = this.fn_validate_url()

        const data_api = await fetch(url, this.options).then((resp) => resp.json())

        if (data_api.length > 0) {
            DOM_HTML.render_banner(data_api.shift())
            global_vars.fetch_results = data_api
            DOM_HTML.render_items();
            fn_storage.fnHandleCurrentGames()
        }else{
            alert("Not found")
        }
    }
}