'use strict'

const Cache = require('../cache/cache')
const memoize = require('../cache/memoize')

module.exports = {
    testCache,
    testMemoize
}


function testCache(test) {
    console.log('Testing cache')
    const cache = new Cache()
    cache.put(0,'First Value')
    test.equal(cache.get(0), 'First Value')
    console.log('Inserted first value in cache ')
    cache.put(1,'Second Value')
    test.equal(cache.count(),2)
    console.log('Inserted second value in cache ')
    console.log('Cache has two elements')
    cache.put(0,'Try first again')
    test.equal(cache.count(),2)
    test.equal(cache.get(0),'Try first again')
    console.log('Cache updated first value ')
    test.done()
}

function getString(id, cb) {
    let str = id + ''
    cb(null,str)
}

function testMemoize(test) {
    let counter = 0
    let getStringWithCache = memoize(getString)
    getStringWithCache(1,(err,data)=>{
        ++counter
        test.equal(data,'1')
    })
    getStringWithCache(1,(err,data)=>{
        test.equal(counter,1)
    })
    getStringWithCache(2,(err,data)=>{
        ++counter
        test.equal(data,'2')
    })
    getStringWithCache(2,(err,data)=>{
        test.equal(counter,2)
    })
    test.done()
}


