import azure.cognitiveservices.speech as speechsdk
import json

speech_key = "31781f395da74eb081215dc6e623393b"
service_region = "eastus"

speech_config = speechsdk.SpeechConfig(subscription=speech_key, region=service_region)
speech_config.speech_synthesis_voice_name = "en-US-JennyNeural"

input_text = """Hello! I'm Zippy, the curious 8-legged octopus with a love for deep sea diving. I explore the depths and coral reefs in search of new discoveries. I'm fascinated by open source underwater projects, as they connect everyone in the vast sea of code. If you have any questions about Monadical or software, feel free to ask. Let's dive into the open source ocean together!"""

ssml = f"""
    <speak version="1.0"
    xmlns="http://www.w3.org/2001/10/synthesis"
    xmlns:mstts="https://www.w3.org/2001/mstts"
    xml:lang="en-US">
        <voice name="en-US-JennyNeural">
            <mstts:viseme type="redlips_front"/>
            <mstts:express-as style="excited">
                <prosody rate="-8%" pitch="23%">
                    {input_text}
                </prosody>
            </mstts:express-as>
        </voice>
    </speak>"""

file_name = "public/infoAudio.wav"
file_config = speechsdk.audio.AudioOutputConfig(filename=file_name)

speech_synthesizer = speechsdk.SpeechSynthesizer(speech_config=speech_config, audio_config=file_config)

viseme_data = []


def viseme_callback(event):
    print(event)
    viseme_data.append({"offset": event.audio_offset / 10000, "id": event.viseme_id})


speech_synthesizer.viseme_received.connect(viseme_callback)

result = speech_synthesizer.speak_ssml_async(ssml=ssml).get()

if result.reason == speechsdk.ResultReason.SynthesizingAudioCompleted:
    with open("public/visemes.json", "w") as f:
        json.dump(viseme_data, f, indent=4)
elif result.reason == speechsdk.ResultReason.Canceled:
    cancellation_details = result.cancellation_details
    if cancellation_details.reason == speechsdk.CancellationReason.Error:
        print("Error details: {}".format(cancellation_details.error_details))
