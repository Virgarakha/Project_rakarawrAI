<?php

namespace App\Services;

use Illuminate\Support\Facades\Http;
use Illuminate\Support\Facades\Storage;

class GeminiService
{
    public function sendMessage($historyText, $photoPath = null)
    {
        $url = "https://api.groq.com/openai/v1/chat/completions";

        // Base content
        $content = [
            [
                "type" => "text",
                "text" => $historyText
            ]
        ];

        // Jika ada foto → tempel sebagai `input_image`
        if ($photoPath) {
            $imageData = base64_encode(Storage::disk('public')->get($photoPath));

            $content[] = [
                "type" => "input_image",
                "image_url" => "data:image/jpeg;base64," . $imageData
            ];
        }

        $data = [
            "model" => "groq/compound",
            "messages" => [
                [
                    "role" => "user",
                    "content" => $content
                ]
            ]
        ];

        $response = Http::withHeaders([
            "Authorization" => "Bearer " . env("GROQ_API_KEY"),
            "Content-Type" => "application/json"
        ])->post($url, $data);

        if ($response->failed()) {
            return "⚠️ Groq Error: " . $response->body();
        }

        return $response->json()['choices'][0]['message']['content']
               ?? "❌ Tidak ada jawaban dari AI.";
    }
}
