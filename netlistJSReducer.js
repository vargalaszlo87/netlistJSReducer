  
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
		// serach the paralell
		for (let i = 0; i < netlist.count; i++) {
			for (let j = 0; j < netlist.count; j++) {
				// equal items
				if (i == j)
					continue;
				
				// is equal?
				const a = new Set(netlist.node[i]);
				const b = new Set(netlist.node[j]);	
				if (eqSet(a,b)) {
				
					// checking variables
					parallel.bool = false;
					t = new Array();
					
					// exist in "isParallel" array?
					for (let x = 0; x < parallel.count; x++) {
						const temp = new Set (parallel.name[x]);
						
						t.push(netlist.line[i][0]);
						t.push(netlist.line[j][0]);

						if (eqSet(new Set (t, j), temp))
							parallel.bool = true;
					
					}
					
					// if it's not on the list
					if (!parallel.bool) {
						parallel.name[parallel.count] = [netlist.line[i][0], netlist.line[j][0]];
						parallel.id[parallel.count] = [i, j];
						parallel.count++;			
					}

				}
				else
					continue;
			}
		}	
		
	
	}
};
	
	
netlistJSReducer.fillingNetlistArray(rawNetlist);
netlistJSReducer.searchParallelItems();
	
