  
// aux functions

const eqSet = (xs, ys) =>
    xs.size === ys.size &&
    [...xs].every((x) => ys.has(x));

// variables	

// dev 
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


let netlist = {
	count: 0,
	line: [],
	node: []
};

let parallel = {
	count: 0,
	name: [],
	id: [],
	bool: false
};

	
const allowedParts = [
	'R','L','C'
];

const netlistJSReducer = {

	fillingNetlistArray: (rawData) => {
		// filling the lineNetlist
		for (const raw of rawData.split("\n")) {
			const [name, node1, node2, value] = raw.trim().split(/\s+/);
			netlist.line.push([name, node1, node2, value]);
			netlist.node.push([node1, node2]);
			netlist.count++;
			
		}		
	},
	
	searchParallelItems: () => {
		const groupMap = new Map();

		for (let i = 0; i < netlist.count; i++) {
			const [name, node1, node2] = netlist.line[i];
			const key = [node1, node2].sort().join("|");

			if (!groupMap.has(key)) {
				groupMap.set(key, []);
			}

			groupMap.get(key).push({ name, index: i });
		}

		// Reset parallel listák
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
	},
		
};
	
netlistJSReducer.fillingNetlistArray(rawNetlist);
netlistJSReducer.searchParallelItems();
	