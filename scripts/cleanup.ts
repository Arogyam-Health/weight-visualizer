import { cleanupExpired } from "@/lib/jobs/cleanup";
cleanupExpired().then(() => console.log("Cleanup complete")).catch((error) => { console.error(error); process.exitCode = 1; });
