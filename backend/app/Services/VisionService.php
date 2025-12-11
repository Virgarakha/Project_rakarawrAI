<?php

namespace App\Services;

use Illuminate\Support\Facades\Http;
use Illuminate\Support\Facades\Storage;

class VisionService
{
    public function sendMessage($historyText, $photoPath = null)
    {
        $url = "https://openrouter.ai/api/v1/chat/completions";

        // Base message
        $messages = [
            [
                "role" => "user",
                "content" => $historyText
            ]
        ];

        // Jika ada gambar
        if ($photoPath) {
            $imageData = base64_encode(Storage::disk('public')->get($photoPath));
            $imageUri = "data:image/jpeg;base64," . $imageData;

            $messages[] = [
                "role" => "user",
                "content" => [
                    ["type" => "input_text", "text" => "Berikut foto dari user:"],
                    ["type" => "input_image", "image_url" => $imageUri]
                ]
            ];
        }

        $payload = [
            "model" => "qwen/qwen3-vl-8b-instruct",
            "messages" => $messages,
            "max_tokens" => 1024
        ];

        $response = Http::withHeaders([
            "Authorization" => "Bearer " . env("OPENROUTER_API_KEY"),
            "Content-Type" => "application/json",
            "HTTP-Referer" => "http://localhost",
            "X-Title" => "Rakha AI Vision"
        ])->post($url, $payload);

        if ($response->failed()) {
            return "⚠️ OpenRouter Error: " . $response->body();
        }

        return $response->json()['choices'][0]['message']['content']
               ?? "❌ Tidak ada jawaban dari Vision AI.";
    }
}
