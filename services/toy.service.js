const fs = require('fs')
var toys = require('../data/toy.json')

function query(filterBy = {}, sortBy = '') {
    // console.log('filterBy: ', filterBy)
    let toysToDisplay = toys
    if (filterBy.inStock === 'true') toysToDisplay = toys.filter(toy => toy.inStock)
    if (filterBy.search) {
        const regExp = new RegExp(filterBy.search, 'i')
        toysToDisplay = toys.filter(toy => regExp.test(toy.name))
    }
    if (sortBy === 'createdAt') toysToDisplay = toysToDisplay.sort((a, b) => a.createdAt - b.createdAt)
    if (sortBy === 'price') toysToDisplay = toysToDisplay.sort((a, b) => a.price - b.price)
    if (sortBy === 'name') toysToDisplay = toysToDisplay.sort((a, b) => {
        if (a.name.toUpperCase() < b.name.toUpperCase()) return -1
        else return 1
    })

    if (filterBy.labels && filterBy.labels.length > 0) {
        const labels = Array.isArray(filterBy.labels) ? filterBy.labels : filterBy.labels.split(',')
        toysToDisplay = toysToDisplay.filter(toy => labels.every(l => toy.labels.includes(l)))
    }

    // if (filterBy.pageIdx !== undefined) {
    //     let startIdx = filterBy.pageIdx * PAGE_SIZE
    //     toysToDisplay = toys.slice(startIdx, startIdx + PAGE_SIZE)
    // }

    return Promise.resolve(toysToDisplay)
}

function get(toyId) {
    const toy = toys.find(toy => toy._id === toyId)
    if (!toy) return Promise.reject('Toy not found!')
    return Promise.resolve(toy)
}

function remove(toyId, loggedinUser) {
    const idx = toys.findIndex(toy => toy._id === toyId)
    if (idx === -1) return Promise.reject('No Such Toy')
    const toy = toys[idx]
    // if (toy.owner._id !== loggedinUser._id) return Promise.reject('Not your toy')
    toys.splice(idx, 1)
    return _saveToysToFile()

}

function save(toy, loggedinUser) {
    if (toy._id) {
        const toyToUpdate = toys.find(currToy => currToy._id === toy._id)
        // if (toyToUpdate.owner._id !== loggedinUser._id) return Promise.reject('Not your toy')
        toyToUpdate.name = toy.name
        toyToUpdate.price = toy.price
    } else {
        toy._id = _makeId()
        toys.push(toy)
    }

    return _saveToysToFile().then(() => toy)
    // return Promise.resolve(toy)
}

function _makeId(length = 5) {
    let text = '';
    const possible = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
    for (let i = 0; i < length; i++) {
        text += possible.charAt(Math.floor(Math.random() * possible.length));
    }
    return text;
}

function _saveToysToFile() {
    return new Promise((resolve, reject) => {

        const toysStr = JSON.stringify(toys, null, 2)
        fs.writeFile('data/toy.json', toysStr, (err) => {
            if (err) {
                return console.log(err);
            }
            console.log('The file was saved!');
            resolve()
        });
    })
}

module.exports = {
    query,
    get,
    remove,
    save
}