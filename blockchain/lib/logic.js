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

'use strict';
/**
 * Sample transaction processor function.
 * @param {org.basic.server.Server} tx The sample transaction instance.
 * @transaction
 */
async function ServerUpdate(tx) {  // eslint-disable-line no-unused-vars
    var factory = getFactory();
    var NS = 'org.basic.server';
    var datacenterid = tx.datacenterid;
  
    datacenterid.servers = '';
  
    if (datacenterid.servers) {
          datacenterid.servers.push(tx);
      } else {
          datacenterid.servers = [tx];
      }
  
    var serverEvent = factory.newEvent(NS, 'ServerEvent');
    serverEvent.Active_Memory = tx.Active_Memory;
    serverEvent.HW_Model = tx.HW_Model;
    serverEvent.Installed_CPUs = tx.Installed_CPUs;
    serverEvent.Installed_RAM = tx.Installed_RAM;
    serverEvent.Server_Model = tx.Server_Model;
    serverEvent.datacenterid = datacenterid;
    emit(serverEvent);
  
    return getAssetRegistry(NS + '.DataCenterId')
      .then(function (serverRegistry) {
            return serverRegistry.update(datacenterid);
        });
    
}

