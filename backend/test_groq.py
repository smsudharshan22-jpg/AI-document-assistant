from groq import Groq

client = Groq(api_key="PASTE_YOUR_FULL_GROQ_API_KEY_HERE")

response = client.chat.completions.create(
    model="llama-3.3-70b-versatile",
    messages=[
        {"role": "user", "content": "Say hello"}
    ]
)

print(response.choices[0].message.content)
