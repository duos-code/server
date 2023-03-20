const express = require('express');
const router = express.Router();
const { c, cpp, node, python, java } = require('compile-run');

// For parsing application/json
router.use(express.json());

// For parsing application/x-www-form-urlencoded
router.use(express.urlencoded({ extended: true }));

const envData = { OS: "windows", cmd: "g++" };

router.post('/c', (req, res) => {
    const { code, stdin } = req.body;

    let resultPromise = c.runSource(code, { stdin: stdin });

    resultPromise
        .then(result => {
            console.log(result);
            res.send(result);
        })
        .catch(err => {
            console.log(err);
            res.send(err);
        });

});

router.post('/cpp', (req, res) => {
    const { code, stdin } = req.body;

    let resultPromise = cpp.runSource(code, { stdin: stdin });

    resultPromise
        .then(result => {
            console.log(result);
            res.send(result);
        })
        .catch(err => {
            console.log(err);
            res.send(err);
        });

});

router.post('/node', (req, res) => {
    const { code, stdin } = req.body;

    let resultPromise = node.runSource(code, { stdin: stdin });

    resultPromise
        .then(result => {
            console.log(result);
            res.send(result);
        })
        .catch(err => {
            console.log(err);
            res.send(err);
        });

});

router.post('/java', (req, res) => {
    const { code, stdin } = req.body;

    let resultPromise = java.runSource(code, { stdin: stdin });

    resultPromise
        .then(result => {
            console.log(result);
            res.send(result);
        })
        .catch(err => {
            console.log(err);
            res.send(err);
        });

});

router.post('/py', (req, res) => {
    const { code, stdin } = req.body;

    let resultPromise = python.runSource(code, { stdin: stdin });

    resultPromise
        .then(result => {
            console.log(result);
            res.send(result);
        })
        .catch(err => {
            console.log(err);
            res.send(err);
        });

});

module.exports = router;