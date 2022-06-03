const global_vars = {
    user_library_games : document.querySelector("#user-library-games"),
    current_user_library: JSON.parse(localStorage.getItem("my-favs-games")) ? JSON.parse(localStorage.getItem("my-favs-games")) : []
}

const DOM_HTML = {
    render_div(id, className){
        const div = document.createElement("div")
        if (id) div.setAttribute('id', id)
        div.classList.add(className)
        return div;
    },
    render_link(url){
        const a = document.createElement("a")
        a.href = url
        a.target = '_blank'
        return a
    },
    render_figure(thumbnail, title){
        const figure = document.createElement("figure")
        const game_img = this.render_img(thumbnail, title)
        const figcaption = document.createElement("figcaption")
        figcaption.textContent = title
        figure.append(game_img, figcaption)
        return figure
    },
    render_img(src, title){
        const img = document.createElement("img")
        img.src = src    
        img.alt = title
        return img
    },
    render_span(genre, className){
        const span = document.createElement("span")
        span.classList.add(className)
        span.innerText = genre
        return span
    },
	render_button(id, className){
		const button = document.createElement("button")
		button.classList.add(className)
		button.setAttribute('id', id)
		return button
	},
    render_extra_info(genre, platform){
        const div = this.render_div(null, 'extra-info')
        const span = this.render_span(genre, 'game-genre')
        div.appendChild(span)

        if (platform.toLowerCase().includes('windows')) {
            const icon = this.render_img('./assets/content/pc.png', 'windows')
            div.appendChild(icon)
    
        } else if(platform.toLowerCase().includes('web')){
            const icon = this.render_img('./assets/content/browser.png', 'browser')
            div.appendChild(icon)
        }
        return div
    },

    render_game_item({ id, thumbnail, title, game_url, genre, platform }) {
        const game_item = this.render_div(`game-${id}`, 'game-library-item')
        const game_link = this.render_link(game_url)
        const game_figure = this.render_figure(thumbnail, title)
        const btn_image = this.render_img('./assets/content/trash.png','')
        const div_hold = this.render_div(null, 'container-holder')
        const button = this.render_button(id, 'btn-remove-game-library')
        const game_info = this.render_extra_info(genre, platform)
        
        button.title = "Remove this game from your Library"

        game_item.append(game_link, div_hold)
        game_link.appendChild(game_figure)
        div_hold.append(game_info, button)
        button.appendChild(btn_image)
        button.addEventListener('click', remove_game)
    
        global_vars.user_library_games.appendChild(game_item)
    }
}

function remove_game(){
    let confirmation = confirm("Would you like to remove this game from your Library?")
    if (confirmation) {
        let index = Array.from(this.parentElement.parentElement.parentElement.children).indexOf(this.parentElement.parentElement)
        global_vars.user_library_games.removeChild(global_vars.user_library_games.children[index])
        global_vars.current_user_library = global_vars.current_user_library.filter(item => item != this.id) 
        update_local_storage();
        alert("Game successfully removed from you library!")
    }
}

const options = {
	method: 'GET',
	headers: {
		'X-RapidAPI-Host': 'free-to-play-games-database.p.rapidapi.com',
		'X-RapidAPI-Key': '64e5d9c68emsh19bbeb4a0465c43p1b5b03jsn4f43aa258c64'
	}
};

const fetch_ID = async(id) => {
	let url = `https://free-to-play-games-database.p.rapidapi.com/api/game?id=${id}`
    
    const data_api = await fetch(url, options).then((resp) => resp.json())
	
    DOM_HTML.render_game_item(data_api)
}


function update_local_storage(){
	localStorage.setItem("my-favs-games", JSON.stringify(global_vars.current_user_library)) 
}

if (global_vars.current_user_library.length > 0) {
	global_vars.current_user_library.forEach(id => fetch_ID(id).catch((error) => console.log(error)))
} else {
    alert('No games found, add games to your library!')
}