
// Mocking the Expo AV Audio class and logic used in ActiveSessionScreen

console.log("--- Starting Audio Logic Simulation Test ---");

// Mock State
let isPlaying = false;
let isBuffering = false;
const setIsPlaying = (val) => { isPlaying = val; console.log(`> State Change: isPlaying -> ${val}`); };
const setIsBuffering = (val) => { isBuffering = val; console.log(`> State Change: isBuffering -> ${val}`); };

// Mock Sound Object
class MockSound {
    constructor() {
        this.statusUpdateCallback = null;
        this.status = { isLoaded: true, isPlaying: true, isBuffering: false };
    }

    setOnPlaybackStatusUpdate(cb) {
        console.log("Listener registered.");
        this.statusUpdateCallback = cb;
        // Immediate callback upon registration (simulating behavior)
        cb(this.status);
    }

    async playAsync() {
        console.log("CMD: playAsync()");
        this.status.isPlaying = true;
        this._emit();
        return { isPlaying: true };
    }

    async pauseAsync() {
        console.log("CMD: pauseAsync()");
        this.status.isPlaying = false;
        this._emit();
        return { isPlaying: false };
    }

    async unloadAsync() {
        console.log("CMD: unloadAsync()");
    }

    _emit() {
        if (this.statusUpdateCallback) {
            this.statusUpdateCallback(this.status);
        }
    }
}

// Logic under test (from ActiveSessionScreen)
async function runComponentLogic() {
    console.log("Mounting component logic...");
    
    // 1. Setup Audio Mode (Mock)
    console.log("Setting Audio Mode...");
    
    // 2. Create Sound
    console.log("Creating Sound Async...");
    const sound = new MockSound();
    // Simulate createAsync returning sound + status
    const initialStatus = { isLoaded: true, isPlaying: true, isBuffering: false };
    
    // 3. Register Listener (The Key Fix)
    sound.setOnPlaybackStatusUpdate((status) => {
        if (status.isLoaded) {
            setIsPlaying(status.isPlaying);
            setIsBuffering(status.isBuffering);
        } else if (status.error) {
            console.log(`Player Error: ${status.error}`);
        }
    });

    // VERIFICATION STEPS
    console.log("\n--- Verification 1: Initial Play ---");
    if (isPlaying !== true) throw new Error("FAILED: Should be playing initially");
    console.log("PASSED: Initial State is Playing");

    console.log("\n--- Verification 2: Toggle Pause ---");
    await sound.pauseAsync();
    if (isPlaying !== false) throw new Error("FAILED: Should be paused");
    console.log("PASSED: State is Paused");

    console.log("\n--- Verification 3: Toggle Play ---");
    await sound.playAsync();
    if (isPlaying !== true) throw new Error("FAILED: Should be playing again");
    console.log("PASSED: State is Playing");
    
    console.log("\n--- Cleanup ---");
    await sound.unloadAsync();
}

runComponentLogic().then(() => {
    console.log("\n✅ ALL TESTS PASSED");
}).catch(e => {
    console.error("\n❌ TEST FAILED:", e.message);
    process.exit(1);
});
