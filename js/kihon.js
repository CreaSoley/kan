// ===============================
// UV1 KIHON TRAINER
// ===============================

class KihonTrainer {

    constructor(options = {}) {

        // paramètres
        this.interval = options.interval || 4000;
        this.mode = options.mode || "random"; // random | cycle | exam
        this.voiceEnabled = options.voice ?? true;

        // état
        this.index = 0;
        this.timer = null;
        this.running = false;

        // liste techniques
        this.techniques = [

            "Mae Geri",
            "Mawashi Geri",
            "Yoko Geri",
            "Ushiro Geri",

            "Oi Zuki",
            "Gyaku Zuki",
            "Tate Zuki",
            "Kizami Zuki",

            "Gedan Barai",
            "Age Uke",
            "Soto Uke",
            "Uchi Uke",

            "Mae Empi",
            "Yoko Empi",

            "Hiza Geri"

        ];

        this.shuffleBag = [];

        // DOM
        this.display = document.getElementById("technique");
    }


    // ===============================
    // START
    // ===============================

    start() {

        if (this.running) return;

        this.running = true;

        this.loop();

        this.timer = setInterval(() => {

            this.loop();

        }, this.interval);
    }


    // ===============================
    // STOP
    // ===============================

    stop() {

        this.running = false;

        clearInterval(this.timer);
    }


    // ===============================
    // NEXT
    // ===============================

    next() {

        this.loop();
    }


    // ===============================
    // LOOP PRINCIPAL
    // ===============================

    loop() {

        let technique;

        switch (this.mode) {

            case "cycle":
                technique = this.getCycle();
                break;

            case "exam":
                technique = this.getExam();
                break;

            default:
                technique = this.getRandom();
        }

        this.show(technique);

        if (this.voiceEnabled) {
            this.speak(technique);
        }
    }


    // ===============================
    // RANDOM
    // ===============================

    getRandom() {

        const i = Math.floor(Math.random() * this.techniques.length);

        return this.techniques[i];
    }


    // ===============================
    // CYCLE
    // ===============================

    getCycle() {

        const technique = this.techniques[this.index];

        this.index++;

        if (this.index >= this.techniques.length) {
            this.index = 0;
        }

        return technique;
    }


    // ===============================
    // EXAM (sans répétition)
    // ===============================

    getExam() {

        if (this.shuffleBag.length === 0) {

            this.shuffleBag = [...this.techniques];

            this.shuffleBag.sort(() => Math.random() - 0.5);
        }

        return this.shuffleBag.pop();
    }


    // ===============================
    // DISPLAY
    // ===============================

    show(text) {

        if (!this.display) return;

        this.display.innerText = text;
    }


    // ===============================
    // VOICE
    // ===============================

    speak(text) {

        if (!window.speechSynthesis) return;

        const utter = new SpeechSynthesisUtterance(text);

        utter.lang = "ja-JP";
        utter.rate = 0.9;
        utter.pitch = 1;

        speechSynthesis.speak(utter);
    }

}


// ===============================
// CONTROLES
// ===============================

const trainer = new KihonTrainer({
    interval: 4000,
    mode: "random",
    voice: true
});


document.getElementById("start").onclick = () => trainer.start();

document.getElementById("stop").onclick = () => trainer.stop();

document.getElementById("next").onclick = () => trainer.next();
