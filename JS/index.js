//Declarando as variaveis globais
const global_vars = {
    game_banner: document.querySelector('.game-banner'),
    grid_all_games: document.querySelector("#grid-all-games"),
    fltr_header: document.querySelectorAll('.header input[type="radio"]'),
    fltr_sidenav: document.querySelectorAll('.sidenav input[type="checkbox"]'),
    user_libray: JSON.parse(localStorage.getItem("my-favs-games")) ? JSON.parse(localStorage.getItem("my-favs-games")) : [],
    fetch_results: null,
    array_inputs: null,
    tituloGame: document.querySelector('h3')
}

const filtersForFetch = {
    platform: "",
    category: [],
}

const fn_filters = {
    fnHandHeadlerFilter() {
        console.log(this.target)
        if (this.id != "all-games") filtersForFetch.platform = this.id;
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

const fn_storage = {
    fnExistInStorage(id) {
        if (global_vars.user_libray.length > 0) {
            let exist = global_vars.user_libray.includes(`${id}`)
            return exist
        }
    },
    fnHandleCurrentGames() {
        global_vars.array_inputs = document.querySelectorAll('.content .extra-info input[type="checkbox"]')

        if (global_vars.array_inputs.length > 0) {
            global_vars.array_inputs.forEach((item) => item.addEventListener('input', this.fnConfirmation))
        }
    },

    fnConfirmation() {
        let existsID = fn_storage.fnExistInStorage(this.id)

        if (!existsID) {
            let confirmation = confirm("Would you like to add this game to your Favorites Games?")
            if (confirmation) {
                global_vars.user_libray.push(this.id)
                fn_storage.fnUpdateLocalStorage()
            } else {
                this.checked = false;
            }
        } else {
            let confirmation = confirm("Would you like to remove this game from your Favorites Games?")
            if (confirmation) {
                global_vars.user_libray = global_vars.user_libray.filter(libID => libID != this.id)
                fn_storage.fnUpdateLocalStorage()
            } else {
                this.checked = true;
            }
        }
    },

    fnUpdateLocalStorage() {
        localStorage.setItem("my-favs-games", JSON.stringify(global_vars.user_libray))
    }
}

const DOM_HTML = { // criar os cards de cada um dos jogos
    render_div(id, className) {
        const div = document.createElement("div")
        if (id) div.setAttribute('id', id)
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

    render_span(genre, className) {
        const span = document.createElement("span")
        span.classList.add(className)
        span.innerText = genre
        return span
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
        const span = this.render_span(genre, 'game-genre')

        let existsID = fn_storage.fnExistInStorage(id)
        if (existsID) input.checked = true;

        div.append(label, span)
        label.append(input, checkmark)

        if (platform.toLowerCase().includes('pc')) {
            const icon = this.render_img('./assets/content/pc.png', 'pc', null, null)
            div.appendChild(icon)
        } else if (platform.toLowerCase().includes('web')) {
            const icon = this.render_img('./assets/content/browser.png', 'browser', null, null)
            div.appendChild(icon)
        }
        return div
    },

    render_items() {
        let games = global_vars.fetch_results.splice(0, 9)
        games.forEach((game_item) => DOM_HTML.render_game_item(game_item))
        fn_storage.fnHandleCurrentGames()
        DOM_HTML.render_button_show_more()
        if (global_vars.fetch_results.length === 0) {
            document.querySelector('.content .container button').remove()
        }
    },
    render_button_show_more() {
        const button = this.render_button('btn-more-items', 'btn-more-items', 'Carregar mais...')
        button.addEventListener('click', this.render_items)
        if (!document.querySelector('.content .container button')) {
            document.querySelector('.content .container').appendChild(button)
        }
    },
    remove_childrens(parent) {
        while (parent.firstChild) {
            parent.removeChild(parent.firstChild);
        }
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
        DOM_HTML.remove_childrens(global_vars.game_banner)
        DOM_HTML.remove_childrens(global_vars.grid_all_games)
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
        DOM_HTML.remove_childrens(global_vars.game_banner)
        DOM_HTML.remove_childrens(global_vars.grid_all_games)

        global_vars.fetch_results = []

        if (document.querySelector('.content .container button')) {
            document.querySelector('.content .container button').remove()
        }


        const url = this.fn_validate_url()

        const data_api = await fetch(url, this.options).then((resp) => resp.json())

        if (data_api.length > 0) {
            DOM_HTML.render_banner(data_api.shift())
            global_vars.fetch_results = data_api

            if (global_vars.fetch_results.length > 0) {
                DOM_HTML.render_items();
                fn_storage.fnHandleCurrentGames()
            }
            global_vars.tituloGame.textContent = "Games"
        } else {
            global_vars.tituloGame.textContent = "Sorry, não encontramos o seu jogo!"
            // alert("Not found")
        }
    }

}
global_vars.fltr_header.forEach((input) => input.addEventListener('input', fn_filters.fnHandHeadlerFilter))
global_vars.fltr_sidenav.forEach((input) => input.addEventListener('input', fn_filters.fnHandleSideNavFilters))

request_api.fetch_initial().catch((error) => console.error(error))
