# model-repo
<p align="center">
<img src="https://res.cloudinary.com/atapas/image/upload/v1632156569/demos/GitHub-Projects_tyxnkl.png" alt="name"/>
<p/>

<h4 align="center">AI communication practice platform for everyone</h4>

<p align="center">
<a href="https://github.com/Daanish2003/roro-ai/blob/master/LICENSE" target="blank">
<img src="https://img.shields.io/github/license/Daanish2003/roro-ai?style=flat-square" alt="tryshape licence" />
</a>
<a href="https://github.com/Daanish2003/roro-ai/fork" target="blank">
<img src="https://img.shields.io/github/forks/Daanish2003/roro-ai?style=flat-square" alt="roro-ai forks"/>
</a>
<a href="https://github.com/Daanish2003/roro-ai/stargazers" target="blank">
<img src="https://img.shields.io/github/stars/Daanish2003/roro-ai?style=flat-square" alt="roro-ai stars"/>
</a>
<a href="https://github.com/Daanish2003/roro-ai/issues" target="blank">
<img src="https://img.shields.io/github/issues/Daanish2003/roro-ai?style=flat-square" alt="roro-ai issues"/>
</a>
<a href="https://github.com/Daanish2003/roro-ai/pulls" target="blank">
<img src="https://img.shields.io/github/issues-pr/Daanish2003/roro-ai?style=flat-square" alt="roro-ai pull-requests"/>
</a>
<a href="https://twitter.com/intent/tweet?text=👋%20Check%20this%20amazing%20repo%20https://github.com/Daanish2003/roro-ai,%20created%20by%20@Daannish2003%20and%20friends%0A%0A%23DEVCommunity%20%23100DaysOfCode"><img src="https://img.shields.io/twitter/url?label=Share%20on%20Twitter&style=social&url=https%3A%2F%2Fgithub.com%2FDaanish2003%2Froro-ai"></a>

<p align="center">
    <a href="https://github.com/Daanish2003/roro-ai/issues/new/choose">Report Bug</a>
    ·
    <a href="https://github.com/Daanish2003/roro-ai/issues/new/choose">Request Feature</a>
</p>

# 👋 Introducing `Roro AI`
`Roro AI` is a real-time AI voice agent that helps users practice and improve their English communication skills by engaging in natural, spoken conversations with an intelligent assistant. Whether you're a student, fresher, or working professional, Roro AI provides a personalized and interactive way to build fluency, confidence, and clarity in spoken English.

🚀 Powered by Cutting-Edge Tech
Roro AI combines a powerful stack of technologies to deliver seamless voice interactions:

🎧 MediaSoup – Real-time, low-latency audio communication

🧠 Gemini 2.0 Flash – Fast and context-aware large language model for generating smart, engaging responses

🗣️ Deepgram – High-performance speech-to-text (STT) and text-to-speech (TTS) engine for natural conversation flow

🎙️ Silero VAD – Lightweight and efficient voice activity detection for accurate speech segmentation and cleaner interactions

Roro AI listens intelligently, responds instantly, and adapts to your communication level — helping you improve through active speaking, not passive learning.

# 🚀 Demo
Here is a quick demo of the app. We hope you enjoy it.

> [The Demo Link](https://roro-ai.com)

Liked it? Please give a ⭐️ to <b>Roro AI Repo</b>.

# 💻 Use Model Repo
Please access `Roro AI` using the URL:

> https://github.com/Daanish2003/roro-ai

# 🔥 Features
`Roro AI` comes with a bundle of features already. You can do the followings with it,

## 🗣️ Real-Time Voice Conversations
 - Engage in live, spoken conversations with an AI agent using low-latency audio powered by MediaSoup. Practice English just like you would with a human.

## 🔊 Smart Speech Detection
- With Silero Voice Activity Detection (VAD), Roro AI accurately detects when you're speaking — reducing noise, trimming silence, and keeping the conversation smooth and focused.

## 🧠 AI-Powered Responses
- Converse with an intelligent assistant backed by Gemini 2.0 Flash, a high-speed, context-aware language model that keeps the dialogue relevant and helpful.

## 🎤 Speech-to-Text (STT)
- Your voice is transcribed in real time using Deepgram, ensuring fast and accurate understanding of what you say.

## 🗣️ Text-to-Speech (TTS)
- Hear the AI speak back to you in a natural, human-like voice thanks to Deepgram's TTS, creating a realistic and immersive conversation experience.

# 🏗️ How to Set up `Roro AI` for Development?

1. Clone the repository

```bash
git clone https://github.com/Daanish2003/roro-ai.git
```

2. Change the working directory

```bash
cd roro-ai
```

3. Install dependencies

```bash
pnpm install
```

4. Create `.env` file in root and add your variables
- Create .env file at `./apps/client/.env` , `./apps/server/.env` , `./apps/media/.env` and `./packages/database`
- add credentials from reference .env.example

5. Docker setup
```
cd packages/database
docker compose up
```

6. Run the app

```bash
pnpm run dev
```

That's All!!! Now open [localhost:3000](http://localhost:3000/) to see the app.

# 🍔 Built With
- [Gemini](https://gemini.google.com)
- [Deepgram](https://deepgram.com)
- [Mediasoup](https://mediasoup.org)
- [Nextjs](https://nextjs.org)
- [Tailwindcss](https://tailwindcss.com/)
- [Shadcn](https://ui.shadcn.com)

# 🛡️ License
This project is licensed under the MIT License - see the [`LICENSE`](LICENSE) file for details.

# 🦄 Upcoming Features
`Roro AI` has all the potentials to grow further. Here are some of the upcoming features planned(not in any order),

- ✔️ AI Session Feedback
- ✔️ View Transcription
- ✔️ End of Utterence(Turn Detector)

If you find something is missing, `Roro AI` is listening. Please create a feature request [from here](https://github.com/Daanish2003/roro-ai/issues/new/choose).

# ⚠️ Limitations
* Incomplete Transcription sentence due to pause in between sentence which make forces the user to have short conversation sentence. This will generate response before even user intended to stop the speech
`Solution`: End of Utterence(Turn Detector)

# 🤝 Contributing to `Roro AI`
Any kind of positive contribution is welcome! Please help us to grow by contributing to the project.

If you wish to contribute, you can work on any features [listed here](https://github.com/Daanish2003/roro-ai#-upcoming-features) or create one on your own. After adding your code, please send us a Pull Request.

> Please read [`CONTRIBUTING`](CONTRIBUTING.md) for details on our [`CODE OF CONDUCT`](CODE_OF_CONDUCT.md), and the process for submitting pull requests to us.

# 🙏 Support

We all need support and motivation. `Roro AI` is not an exception. If you found the app helpful, consider supporting us with a coffee.

<a href="https://buymeacoffee.com/daanish2003">
    <img src="https://cdn.buymeacoffee.com/buttons/v2/default-yellow.png" height="50px">
</a>

---

<h3 align="center">
A ⭐️ to <b>Roro AI</b> is must as a motivation booster.
</h3>

  
