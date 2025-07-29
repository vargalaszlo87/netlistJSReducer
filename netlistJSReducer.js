/*!
 * @project netlistJSReducer  v.0.1	
 * @file netlistJSReducer.js
 * @brief This is the file of main methods.
 *
 * Version information:
 *
 * N/A
 *
 * Features:
 * - searching series/parallel items
 * - merging series/parallel items
 *
 * @author Varga Laszlo
 *
 * @website https://github.com/vargalaszlo87/netlistJSReducer
 * @website http://vargalaszlo.com
 * @website http://ha1cx.hu
 *
 * @date 2025-07-29
 *
 * @license
 * This program is free software: you can redistribute it and/or modify it
 * under the terms of the GNU General Public License as published by the Free
 * Software Foundation, either version 3 of the License, or (at your option)
 * any later version.
 *
 * This program is distributed in the hope that it will be useful, but WITHOUT
 * ANY WARRANTY; without even the implied warranty of MERCHANTABILITY or
 * FITNESS FOR A PARTICULAR PURPOSE. See the GNU General Public License for
 * more details.
 *
 * You should have received a copy of the GNU General Public License along with
 * this program.  If not, see <http://www.gnu.org/licenses/>.
 *
 */
 
 
/*!
 * sample netlist
 */
 
const rawNetlist = `
C1 port1 0 47p
C2 N001 0 220p
C3 N001 port1 47p
C4 0 port2 220p
C5 N001 N002 10p
L1 port1 N001 270n
L2 N001 N002 270n
R1 N001 N002 720
C6 port2 port1 1p
C7 N002 port2 10p
`.trim();

  
/*!
 * aux functions
 */
 
const eqSet = (xs, ys) =>
    xs.size === ys.size &&
    [...xs].every((x) => ys.has(x));
	
function removeIndexes(array, indexes) {
  indexes.sort((a, b) => b - a);
  for (let index of indexes) {
    if (index >= 0 && index < array.length) {
      array.splice(index, 1);
    }
  }
  return array;
}

/*!
 * Variables
 */	

let sys = {
	stat: 1
};

let netlist = {
	count: 0,
	line: [],
	node: [],
	merged: []
};

let parallel = {
	count: 0,
	name: [],
	id: [],
	bool: false
};

let series = {
	count: 0,
	name: [],
	id: [],
	bool: false
}

const allowedParts = [
	'R','L','C'
];

/*!
 * netlistJSReducer
 */

const netlistJSReducer = {


	/*!
	 * filling the netlist array
	 */

	fillingNetlistArray: (rawData) => {
		
		// filling the lineNetlist
		for (const raw of rawData.split("\n")) {
			const [name, node1, node2, value] = raw.trim().split(/\s+/);
			netlist.line.push([name, node1, node2, value]);
			netlist.node.push([node1, node2]);
			netlist.count++;
		}

		// update sys status		
		sys.stat = sys.stat << 1;
	},
	
	
	/*!
	 * searching the parallel items in circuit
	 */	
	
	searchParallelItems: () => {
		const groupMap = new Map();
		
		// build nodes
		for (let i = 0; i < netlist.count; i++) {
			const [name, node1, node2] = netlist.line[i];
			const key = [node1, node2].sort().join("|");

			if (!groupMap.has(key)) {
				groupMap.set(key, []);
			}

			groupMap.get(key).push({ name, index: i });
		}

		// parallel lists to null
		parallel.count = 0;
		parallel.name = [];
		parallel.id = [];

		for (const [key, group] of groupMap.entries()) {
			if (group.length > 1) {
				parallel.name.push(group.map(g => g.name));
				parallel.id.push(group.map(g => g.index));
				parallel.count++;
			}
		}
		
		// update sys status
		sys.stat = sys.stat << 1;
	},	
	
	
	/*!
	 * merging the parallel items in circuit
	 */		
				
	changeParallelItems: () => { 
		for (const i of parallel.id) {
			
			// temp variables for new item
			let tempName = new Array();
			let tempValue = new Array();
			let tempNodes = new Array();

			// build paralell names
			for (const j of i) {
				if (netlist.line[j]) {
					tempName.push(netlist.line[j][0]);
					tempValue.push(netlist.line[j][3]);
					tempNodes.push([netlist.line[j][1], netlist.line[j][2]]);
				}
			}
			
			// add new item
			netlist.line.push([tempName.join("|"), tempNodes[0][0], tempNodes[0][1], tempValue.join("|")]);
			netlist.node.push([tempNodes[0][0], tempNodes[0][1]]);
			netlist.count++;

		}
			
		// delete paralleled items
		let flatArray = parallel.id.flat();
		removeIndexes(netlist.line, flatArray);
		removeIndexes(netlist.node, flatArray);
		netlist.count -= flatArray.length;
		
		// add to merged array		
		for (let i = 0; i < parallel.id.length; i++) {
		  netlist.merged.push(netlist.line.length - 1 - i);
		}
		
		// update sys status
		sys.stat = sys.stat << 1;	
	},


	/*!
	 * searching the series items in circuit
	 */	

	searchSeriesItems: () => {
		const nodeMap = new Map();

		// build nodes
		for (let i = 0; i < netlist.count; i++) {
			const [name, node1, node2] = netlist.line[i];

			for (const node of [node1, node2]) {
				if (!nodeMap.has(node)) {
					nodeMap.set(node, []);
				}
				nodeMap.get(node).push({ name, index: i });
			}
		}

		// parallel lists to null
		series.count = 0;
		series.name = [];
		series.id = [];
		series.bool = false;

		// find the nodes that only connect two nodes.
		for (const [node, group] of nodeMap.entries()) {
			if (["0", "port1", "port2"].includes(node)) continue;

			if (group.length === 2) {
				series.name.push(group.map(g => g.name));
				series.id.push(group.map(g => g.index));
				series.count++;
				series.bool = true;
			}
		}

		// update sys status
		sys.stat = sys.stat << 1;
	},
	
	
	/*!
	 * merging the series items in circuit
	 */		
	
	changeSeriesItems: () => { 
		for (const i of series.id) {
			
			// temp variables for new item
			let tempName = new Array();
			let tempValue = new Array();
			let tempNodes = new Array();

			// build series names
			for (const j of i) {
				if (netlist.line[j]) {
					tempName.push(netlist.line[j][0]);
					tempValue.push(netlist.line[j][3]);
					tempNodes.push([netlist.line[j][1], netlist.line[j][2]]);
				}
			}
			
			// add new item
			netlist.line.push([tempName.join("+"), tempNodes[0][0], tempNodes[0][1], tempValue.join("|")]);
			netlist.node.push([tempNodes[0][0], tempNodes[0][1]]);
			netlist.count++;

		}
			
		// delete series items
		let flatArray = series.id.flat();
		removeIndexes(netlist.line, flatArray);
		removeIndexes(netlist.node, flatArray);
		netlist.count -= flatArray.length;
		
		// add to merged array		
		for (let i = 0; i < series.id.length; i++) {
		  netlist.merged.push(netlist.line.length - 1 - i);
		}
		
		// update sys status
		sys.stat = sys.stat << 1;	
	},	
	
	

};


// try it out
	
netlistJSReducer.fillingNetlistArray(rawNetlist);
netlistJSReducer.searchParallelItems();
netlistJSReducer.changeParallelItems();
netlistJSReducer.searchSeriesItems();
netlistJSReducer.changeSeriesItems();


	
console.log(netlist.line)
