"use strict";

let count = 0;
const done = [0, 0, 0, 0];
let ecoLastText = "";
let ecoLastBtn = null;

const $ = (id) => document.getElementById(id);

function go(n) {
    document.querySelectorAll(".screen").forEach((screen) => {
        screen.classList.remove("active");
        screen.scrollTop = 0;
    });

    const nextScreen = $("s" + n);
    if (!nextScreen) return;

    nextScreen.classList.add("active");
    $("bar").style.width = (Math.min(n, 5) / 5 * 100) + "%";

    nextScreen.scrollTop = 0;
}

function speak(text, button = null) {
    ecoLastText = text;
    ecoLastBtn = button;

    $("ecoSubtitles").textContent = text;
    $("ecoVideo").classList.add("show");
    $("ecoBot").classList.add("talking");
    $("ecoSpeaking").style.display = "inline-block";

    if (!window.speechSynthesis) {
        $("ecoSubtitles").textContent =
            text + " (Audio is not supported in this browser.)";
        $("ecoBot").classList.remove("talking");
        return;
    }

    window.speechSynthesis.cancel();

    const utterance = new SpeechSynthesisUtterance(text);
    utterance.lang = "en-US";
    utterance.rate = 0.72;
    utterance.pitch = 1.18;

    const voices = window.speechSynthesis.getVoices();
    const preferred =
        voices.find((voice) =>
            voice.lang &&
            voice.lang.toLowerCase().startsWith("en") &&
            /female|samantha|zira|aria|jenny|ava/i.test(voice.name)
        ) ||
        voices.find((voice) =>
            voice.lang && voice.lang.toLowerCase().startsWith("en")
        );

    if (preferred) utterance.voice = preferred;
    if (button) button.classList.add("audioPulse");

    utterance.onend = () => stopTalkingAnimation(button);
    utterance.onerror = () => stopTalkingAnimation(button);

    window.speechSynthesis.speak(utterance);
}

function stopTalkingAnimation(button = null) {
    $("ecoBot").classList.remove("talking");
    $("ecoSpeaking").style.display = "none";
    if (button) button.classList.remove("audioPulse");
}

function closeEcoVideo() {
    if (window.speechSynthesis) window.speechSynthesis.cancel();

    $("ecoVideo").classList.remove("show");
    $("ecoBot").classList.remove("talking");
    $("ecoSpeaking").style.display = "none";

    if (ecoLastBtn) ecoLastBtn.classList.remove("audioPulse");
}

function replayEco() {
    if (ecoLastText) speak(ecoLastText, ecoLastBtn);
}

function sayIntro(button) {
    speak(
        "Welcome, Eco-Agent! Green Valley is in danger. Waste is growing, water is polluted, and green spaces are disappearing. Solve four challenges, collect the secret code, and save Green Valley. Are you ready?",
        button
    );
}

function audio1(button) {
    speak(
        "Keep rivers clean. Never throw plastic into the water. Put plastic bottles in the recycling bin and encourage your community to do the same.",
        button
    );
}

function audio3(button) {
    speak(
        "The neighborhood park has fewer trees every month. Without plants, there is less shade and fewer homes for small animals. The community can work together to plant native trees and care for them.",
        button
    );
}

function hint(n) {
    $("h" + n).style.display = "block";
    playSfx("hint");
}

function star(n) {
    if (done[n - 1]) return;

    done[n - 1] = 1;
    count++;
    $("stars").textContent = "⭐ " + count + " / 4";
    playSfx("good");
}

function pick(n, ok) {
    const feedback = $("f" + n);

    if (ok) {
        feedback.className = "feedback ok";
        feedback.innerHTML =
            "🎉 Correct! You earned an Eco-Star and a code crystal!";

        $("d" + n).textContent = [7, 3, 5, 2][n - 1];
        $("n" + n).disabled = false;
        star(n);
    } else {
        feedback.className = "feedback bad";
        feedback.innerHTML =
            "🌱 Almost! Listen again and try one more time. You can do it!";
        playSfx("oops");
    }
}

function check2() {
    const value = $("a2").value.trim().toLowerCase();

    if (value === "recycle") {
        $("f2").className = "feedback ok";
        $("f2").innerHTML = "🎉 YES! RECYCLE is the magic eco-word!";
        $("d2").textContent = "3";
        $("n2").disabled = false;
        star(2);
    } else {
        $("f2").className = "feedback bad";
        $("f2").innerHTML =
            "🤔 Not yet. Look at the clue: R _ C Y C L E";
        playSfx("oops");
    }
}

function check4() {
    const value = $("a4").value.trim().toLowerCase();

    const verbs = [
        "reduce", "reuse", "recycle", "protect", "plant",
        "save", "clean", "conserve", "collect"
    ];

    const targets = [
        "water", "river", "tree", "trees", "plastic", "waste",
        "park", "environment", "energy", "paper", "glass",
        "nature", "plants", "school", "community"
    ];

    const isValid =
        value.split(/\s+/).filter(Boolean).length >= 5 &&
        verbs.some((verb) => value.includes(verb)) &&
        targets.some((target) => value.includes(target));

    if (isValid) {
        $("f4").className = "feedback ok";
        $("f4").innerHTML =
            "🌟 Wonderful Eco-Promise! Your idea can help the community!";
        $("d4").textContent = "2";
        $("n4").disabled = false;
        star(4);
    } else {
        $("f4").className = "feedback bad";
        $("f4").innerHTML =
            '🌱 Add an eco-action and what you will help. Example: “We will plant trees at school.”';
        playSfx("oops");
    }
}

function finish() {
    const value = $("final").value.replace(/\D/g, "");

    if (value === "7352") {
        $("ff").className = "feedback ok";
        $("ff").innerHTML = "⚡ SYSTEM ACTIVATED!";

        playSfx("win");
        confetti();

        setTimeout(() => {
            go(6);
            speak(
                "Congratulations, Eco-Agent! You saved Green Valley. Protecting the environment is everyone’s responsibility."
            );
        }, 900);
    } else {
        $("ff").className = "feedback bad";
        $("ff").innerHTML =
            "🔎 Check your four code crystals and try again!";
        playSfx("oops");
    }
}

function playSfx(type) {
    try {
        const AudioContextClass =
            window.AudioContext || window.webkitAudioContext;

        const context = new AudioContextClass();
        const oscillator = context.createOscillator();
        const gain = context.createGain();

        oscillator.connect(gain);
        gain.connect(context.destination);

        const frequency =
            type === "good" ? 660 :
            type === "win" ? 523 :
            type === "hint" ? 440 :
            type === "start" ? 392 : 220;

        oscillator.frequency.value = frequency;

        gain.gain.setValueAtTime(0.12, context.currentTime);
        gain.gain.exponentialRampToValueAtTime(
            0.001,
            context.currentTime + 0.25
        );

        oscillator.start();
        oscillator.stop(context.currentTime + 0.26);
    } catch (error) {
        console.debug("Sound effect unavailable.", error);
    }
}

function confetti() {
    const icons = ["🎉", "⭐", "🌱", "💚", "🌈"];

    for (let i = 0; i < 45; i++) {
        const piece = document.createElement("div");
        piece.className = "confetti";
        piece.textContent = icons[i % icons.length];
        piece.style.left = Math.random() * 100 + "vw";
        piece.style.animationDelay = Math.random() * 0.8 + "s";

        document.body.appendChild(piece);

        setTimeout(() => piece.remove(), 4000);
    }
}

function bindEvents() {
    $("startMissionBtn")?.addEventListener("click", () => {
        go(1);
        playSfx("start");
    });

    $("watchIntroBtn")?.addEventListener("click", (event) =>
        sayIntro(event.currentTarget)
    );

    $("watchLevel1Btn")?.addEventListener("click", (event) =>
        audio1(event.currentTarget)
    );

    $("watchLevel3Btn")?.addEventListener("click", (event) =>
        audio3(event.currentTarget)
    );

    document.querySelectorAll("[data-pick-level]").forEach((button) => {
        button.addEventListener("click", () => {
            const level = Number(button.dataset.pickLevel);
            const correct = button.dataset.correct === "true";
            pick(level, correct);
        });
    });

    $("hint1Btn")?.addEventListener("click", () => hint(1));
    $("hint2Btn")?.addEventListener("click", () => hint(2));
    $("hint3Btn")?.addEventListener("click", () => hint(3));
    $("hint4Btn")?.addEventListener("click", () => hint(4));

    $("n1")?.addEventListener("click", () => go(2));
    $("n2")?.addEventListener("click", () => go(3));
    $("n3")?.addEventListener("click", () => go(4));
    $("n4")?.addEventListener("click", () => go(5));

    $("check2Btn")?.addEventListener("click", check2);
    $("a2")?.addEventListener("keydown", (event) => {
        if (event.key === "Enter") check2();
    });

    $("check4Btn")?.addEventListener("click", check4);
    $("finishBtn")?.addEventListener("click", finish);

    $("final")?.addEventListener("keydown", (event) => {
        if (event.key === "Enter") finish();
    });

    $("ecoCloseBtn")?.addEventListener("click", closeEcoVideo);
    $("ecoContinueBtn")?.addEventListener("click", closeEcoVideo);
    $("ecoReplay")?.addEventListener("click", replayEco);

    $("ecoVideo")?.addEventListener("click", (event) => {
        if (event.target === $("ecoVideo")) closeEcoVideo();
    });

    document.addEventListener("keydown", (event) => {
        if (event.key === "Escape" && $("ecoVideo")?.classList.contains("show")) {
            closeEcoVideo();
        }
    });

    $("playAgainBtn")?.addEventListener("click", () => window.location.reload());
}

document.addEventListener("DOMContentLoaded", () => {
    bindEvents();
    go(0);
});