import { cronJobs } from "convex/server";
import { api } from "./_generated/api.js";

const crons = cronJobs();

// Appelle l'action interne `simulateTickAction` toutes les minutes via la
// référence générée `api[...]`. Utiliser `api` évite d'importer directement
// des Convex FunctionReferences et contourne l'analyse qui refuse les appels
// de fonctions Convex directes entre modules.
crons.interval(
	"simulate match progression",
	{ minutes: 1 },
	api["matches/simulateTickAction"].simulateTickAction,
);

export default crons;
