/*
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 * http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */

// This is a simple sample that will demonstrate how to use the
// API connecting to a HyperLedger Blockchain Fabric
//
// The scenario here is using a simple model of a participant of 'Student'
// and a 'Test' and 'Result'  assets.

'use strict';

const BusinessNetworkConnection = require('composer-client').BusinessNetworkConnection;
const Table = require('cli-table');
const winston = require('winston');
const prettyjson = require('prettyjson');

// these are the credentials to use to connect to the Hyperledger Fabric
let cardname = 'admin@tutorial-network';

const LOG = winston.loggers.get('application');


/** Class for the server registry*/
class ServerRegistry {

   /**
    * Need to have the mapping from bizNetwork name to the URLs to connect to.
    * bizNetwork nawme will be able to be used by Composer to get the suitable model files.
    *
    */
    constructor() {
        this.bizNetworkConnection = new BusinessNetworkConnection();
    }

   /** 
    * @description Initalizes the ServerRegsitry by making a connection to the Composer runtime
    * @return {Promise} A promise whose fullfillment means the initialization has completed
    */
    async init() {
        this.businessNetworkDefinition = await this.bizNetworkConnection.connect(cardname);
        LOG.info('ServerRegistry:<init>', 'businessNetworkDefinition obtained', this.businessNetworkDefinition.getIdentifier());
    }

   /** 
    * Listen for the sale transaction events
    */
    listen() {
        LOG.info('Awaiting events');
        this.bizNetworkConnection.on('event', (evt) => {
            LOG.info('************Received Event**************');
            //LOG.info(evt);
            console.log(evt);

            let options = {
                properties: { key:'value'}
            };
        });
    }

  
   /** 
    * Updates a fixes asset for selling..
    * @return {Promise} resolved when this update has completed
    */
    async updateServer(args) {
        console.log(args);
        let Active_Memory = args._[1]
        let HW_Model = args._[2];
        let Installed_CPUs = args._[3];
        let Installed_RAM = args._[4];
        let Server_Model = args._[5];
        let datacenterid = args._[6];

        const METHOD = 'Server';
        let factory        = this.businessNetworkDefinition.getFactory();
        let dataCenterRelation = factory.newRelationship('org.basic.server', 'DataCenterId', datacenterid);

        let transaction    = factory.newTransaction('org.basic.server','Server');
        transaction.Active_Memory  = Active_Memory;
        transaction.HW_Model = HW_Model;
        transaction.Installed_CPUs = Installed_CPUs;
        transaction.Installed_RAM = Installed_RAM;
        transaction.Server_Model = Server_Model;
        transaction.datacenterid = dataCenterRelation;

        LOG.info(METHOD, 'Submitting transaction');
        await this.bizNetworkConnection.submitTransaction(transaction);
    }

   /** 
    * bootstrap into the resgitry a few example land titles
    * @return {Promise} resolved when the assets have been created
    */
    async _bootstrapTitles() {
        LOG.info('ServerRegistry:_bootstrapTitles', 'getting asset registry for "org.basic.server.DataCenterId"');
        let owner;
        LOG.info('about to get asset registry');

        try {
            this.titlesRegistry = await this.bizNetworkConnection.getAssetRegistry('org.basic.server.DataCenterId');
            // got the assest registry for land titles
            LOG.info('ServerRegistry:_bootstrapTitles', 'got asset registry');
            LOG.info('ServerRegistry:_bootstrapTitles', 'getting factory and adding assets');
            let factory = this.businessNetworkDefinition.getFactory();

            LOG.info('ServerRegistry:_bootstrapTitles', 'Creating a personnel');
            owner = factory.newResource('org.basic.server', 'Personnel', 'Fred@email.com');
            owner.firstname = 'Fred';
            owner.lastname = 'Bloggs';


            LOG.info('ServerRegistry:_bootstrapTitles', 'Creating a land title#1');
            let landTitle1 = factory.newResource('org.basic.server', 'DataCenterId', 'ADM');
           
     
            LOG.info('ServerRegistry:_bootstrapTitles', 'Adding these to the registry');
            await this.titlesRegistry.addAll([landTitle1]);
            let personRegistry = await this.bizNetworkConnection.getParticipantRegistry('org.basic.server.Personnel');
            await personRegistry.add(owner);
        } catch(error) {
            console.log(error);
            LOG.error('ServerRegsitry:_bootstrapTitles', error);
            throw error;
        }

    }

   /**
    * List the land titles that are stored in the Land Title Resgitry
    * @return {Table} returns a table of the land titles.
    */
    async listTitles() {
        const METHOD = 'listTitles';

        let landTitleRegistry;
        let personRegistry;

        LOG.info(METHOD, 'Getting the asset registry');
        // get the land title registry and then get all the files.

        try {
            let landTitleRegistry = await this.bizNetworkConnection.getAssetRegistry('org.basic.server.DataCenterId');
            let personRegistry = await this.bizNetworkConnection.getParticipantRegistry('org.basic.server.Personnel');
            LOG.info(METHOD, 'Getting all assest from the registry.');
            let aResources = await personRegistry.resolveAll();
            LOG.info(METHOD, 'Current Land Titles');
            let table = new Table({
                head: ['TitleID', 'OwnerID', 'First Name', 'Surname', 'Description', 'ForSale']
            });
            let arrayLength = aResources.length;

            for (let i = 0; i < arrayLength; i++) {

                let tableLine = [];
                console.log(aResources[i]);
                //tableLine.push(aResources[i].titleId);
                //tableLine.push(aResources[i].owner.personId);
                //tableLine.push(aResources[i].owner.firstName);
                //tableLine.push(aResources[i].owner.lastName);
                //tableLine.push(aResources[i].information);
                //tableLine.push(aResources[i].forSale ? 'Yes' : 'No');
                //table.push(tableLine);
            }

            // Put to stdout - as this is really a command line app
            return table;
        } catch(error) {
            console.log(error);
            this.log.error(METHOD, 'uh-oh', error);
        }

    }

   /**
    * @description - run the listtiles command
    * @param {Object} args passed from the command line
    * @return {Promise} resolved when the action is complete
    */
    static async listCmd(args) {
        let lr = new ServerRegistry('serverRegsitry');
        
        await lr.init();
        console.log("A");
        
        let results = await lr.listTitles();
        LOG.info('Titles listed');
        LOG.info('\n'+results.toString());
    }

   /**
    * @description - run the listtiles command
    * @param {Object} args passed from the command line
    * @return {Promise} resolved when the action is complete
    */
    static async listen(args) {
        let lr = new ServerRegistry('serverRegsitry');
        await lr.init();
        let results = await lr.listen();
        LOG.info('Listened for events');
        
    }

  /**
   * @description - run the add default assets command
   * @param {Object} args passed from the command line
   * @return {Promise} resolved when complete
   */
    static async addDefaultCmd(args) {
        let lr = new ServerRegistry('serverRegsitry');
        await lr.init();
        let results = await lr._bootstrapTitles();
        LOG.info('Default titles added');
    }

   /**
    * @description - run the listtiles command
    * @param {Object} args passed from the command line
    * @return {Promise} resolved when the action is complete
    */
    static async submitCmd(args) {
        let lr = new ServerRegistry('serverRegsitry');
        await lr.init();
        let results = await lr.updateServer(args);
        LOG.info('Transaction Submitted');
    }
}
module.exports = ServerRegistry;
