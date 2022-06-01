//Declarando as variaveis globais
const global_vars = {
    game_banner: document.querySelector('.game-banner'),
    grid_all_games: document.querySelector("#grid-all-games"),
    fltr_header: document.querySelectorAll('.header input[type="radio"]'),
    fltr_sidenav: document.querySelectorAll('.sidenav input[type="checkbox"]'),
    user_libray: JSON.parse(localStorage.getItem("my-favs-games")) ? JSON.parse(localStorage.getItem("my-favs-games")) : [],
    fetch_results: null,
    array_inputs: null,
}

const filtersForFetch = {
    platform: "",
    category: [],
}

const fn_filters = {
    fnHandHeadlerFilter() {
        if (this.id != "all-game") filtersForFetch.platform = this.id;
        else filtersForFetch.platform = ''

        request_api.fetch_filtered().catch((error) => console.log(error))
    },

    fnHandleSideNavFilters() {
        let category = filtersForFetch.category;

        if (this.checked && !category.includes(this.id)) category.push(this.id)
        else filtersForFetch.category = category.filter((str) => str != this.id)

        request_api.fetch_filtered().catch((error) => console.log(error))
    }
}

const DOM_HTML = { // criar os cards de cada um dos jogos
    render_div(id, className) {
        const div = document.createElement("div")
        if (div) div.setAttribute('id', id)
        div.classList.add(className)
        return div;
    },

    render_link(url) {
        const a = document.createElement("a")
        a.href = url
        a.target = '_blank'
        return a
    },

    render_figure(thumbnail, title) {
        const figure = document.createElement("figure")
        const game_img = this.render_img(thumbnail, title, 262, 148)
        const figcaption = document.createElement("figcaption")
        figcaption.textContent = title
        figure.appendChild(game_img)
        figure.appendChild(figcaption)
        return figure
    },

    render_img(src, title, width, height) {
        const img = document.createElement("img")
        img.src = src
        img.alt = title
        if (width && height) {
            img.width = `${width}`
            img.height = `${height}`
        }
        return img
    },

    render_input(id) {
        const input = document.createElement('input')
        input.id = `${id}`
        input.type = 'checkbox'
        return input
    },

    render_label(className) {
        const label = document.createElement('label')
        label.title = "Adicionar/Remover este jogo na sua lista de favoritos"
        label.classList.add(className)
        return label
    },

    render_button(id, className, text) {
        const button = document.createElement('button')
        button.setAttribute('id', id)
        button.classList.add(className)
        button.textContent = text
        return button
    },

    render_banner({ id, thumbnail, title, game_url, genre, platform }) {
        const game_item = this.render_div(`game${id}`, 'game-item')
        const game_link = this.render_link(game_url)
        const game_figure = this.render_figure(thumbnail, title)

        const currentImage = game_figure.firstElementChild //rendereização do primeiro card de jogo
        currentImage.setAttribute('width', '600')
        currentImage.setAttribute('height', '250')

        const game_info = this.render_extra_info(id, genre, platform)

        game_item.append(game_link, game_info)
        game_link.appendChild(game_figure)
        global_vars.game_banner.appendChild(game_item)
    },

    render_game_item({ id, thumbnail, title, game_url, genre, platform }) {
        const game_item = this.render_div(`game-${id}`, 'game-item')
        const game_link = this.render_link(game_url)
        const game_figure = this.render_figure(thumbnail, title)
        const game_info = this.render_extra_info(id, genre, platform)

        game_item.append(game_link, game_info)
        game_link.appendChild(game_figure)

        global_vars.grid_all_games.appendChild(game_item)
    },

    render_extra_info(id, genre, platform) {
        const div = this.render_div(null, 'extra-info')
        const label = this.render_label('favorite')
        const checkmark = this.render_div(null, "checkmark_favorite")
        const input = this.render_input(id)
        const span = this.rende_span(genre, 'game-genre')

        let existsID = fn_storage.fnExistInStorage(id)
        if (existsID) input.checked = true;

        div.appendChild(label, span)
        label.append(input, checkmark)
        
        //continuar daqui
    }
}
//Fetch que fetch que faz os jogos aparecerem
const request_api = {
    options: {
        method: 'GET',
        headers: {
            'X-RapidAPI-Host': 'free-to-play-games-database.p.rapidapi.com',
            'X-RapidAPI-Key': '64e5d9c68emsh19bbeb4a0465c43p1b5b03jsn4f43aa258c64'
        }
    },

    fn_validate_url() {
        let url = 'https://free-to-play-games-database.p.rapidapi.com/api/'

        let platform = filtersForFetch.platform.length;
        let categorys = filtersForFetch.category.length;

        if (platform === 0 && categorys === 0) {
            url += 'games'
            return url
        } else if (platform === 0 && categorys === 1) { // Simple category
            url += `games?category=${filtersForFetch.category[0]}`
            return url
        } else if (platform > 1 && categorys === 0) { //Simple platform
            url += `games?platform=${filtersForFetch.platform}`
            return url
        } else if (platform === 0 && categorys > 1) {
            url += `filter?tag=${filtersForFetch.category.join(".")}`
            return url
        } else if (platform > 1 && categorys === 1) {
            url += `games?platform=${filtersForFetch.platform}&category=${filtersForFetch.category[0]}`
            return url
        } else if (platform > 1 && categorys > 1) {
            url += `filter?tag=${filtersForFetch.category.join(".")}&platform=${filtersForFetch.platform}`
            return url
        }
    },

    async fetch_initial() {
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
    async fetch_filtered() {
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
        } else {
            alert("Not found")
        }
    }
}