const express = require('express');
const cors = require('cors');
const { Web3 } = require('web3')
const axios = require('axios');
const fs = require('fs');


const app = express();
const PORT = 4000;


const web3 = new Web3('http://localhost:7545'); // Connect to your Ethereum node
// Load compiled contract ABI and bytecode
const contractData = JSON.parse(fs.readFileSync('poll.abi', 'utf-8'));
const bytecode = fs.readFileSync('poll.bin', 'utf-8');
const PollContract = new web3.eth.Contract(contractData);

app.use(cors());
// Define your API endpoint and target URL
const apiEndpoint = '/api';
const targetURL = 'https://developer.worldcoin.org';

// Create a proxy middleware for the API endpoint


app.use(express.json());
app.post('/createContract', async (req, res) => {
    const { title, options, account } = req.body;
    console.log(title, options, account)

    try {// Deploy the contract using the first account
        const deployedContract = await PollContract.deploy({
            data: '0x' + bytecode,
            arguments: [title, options],
        }).send({
            from: account,
            gas: '3000000',
        });

        res.json({ contractAddress: deployedContract.options.address });
    }
    catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
});

app.post('/vote', async (req, res) => {
    const { contractAddress, option, hash, account } = req.body;
    console.log(contractAddress);

    const contractInstance = new web3.eth.Contract(contractData, contractAddress);


    try {
        // Cast vote
        await contractInstance.methods.vote(option, hash).send({
            from: account,
            gas: '1000000',
        });

        res.json({ success: true, message: 'Vote cast successfully' });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
});

app.get('/getPoll/:contractAddress', async (req, res) => {
    const { contractAddress } = req.params;

    const contractInstance = new web3.eth.Contract(contractData, contractAddress);

    try {
        // Cast vote

        const result = await contractInstance.methods.getMetadata().call();
        const title = result['0'];
        const options = result['1'];

        console.log("Title:", title);
        console.log("Options:", options);
        res.json({ success: true, title: title, options: options });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
});

app.get('/getDetails/:contractAddress', async (req, res) => {
    const { contractAddress } = req.params;

    const contractInstance = new web3.eth.Contract(contractData, contractAddress);

    try {
        // Cast vote

        const result = await contractInstance.methods.getResults().call();
        console.log(result)
        const title = result['0'];
        const options = result['1'];
        const votes = result['2'].map(String);

        res.json({ success: true, title: title, options: options, votes:votes });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
});


//middleware to WorldID
app.post(`${apiEndpoint}/*`, async (req, res) => {
    try {
        // Forward the request to the Worldcoin API using Axios
        console.log(`${targetURL}${req.url}`)
        const worldcoinResponse = await axios.post(`${targetURL}${req.url}`, req.body);
        res.json(worldcoinResponse.data);
    } catch (error) {
        console.error('Error forwarding request to Worldcoin:', error);
        res.status(500).json({ success: false, message: 'Error forwarding request to Worldcoin' });
    }
});

// Start the Express server
app.listen(PORT, () => {
    console.log(`Proxy server is running on http://localhost:${PORT}`);
});
