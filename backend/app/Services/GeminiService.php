<?php

namespace App\Services;

use Illuminate\Support\Facades\Http;
use Illuminate\Support\Facades\Storage;

class GeminiService
{
    // Ini prompt gaya bicara default
    protected $stylePrompt;

    public function __construct()
    {
        // Bisa diubah sesuai gaya yang diinginkan
        $this->stylePrompt = "Kamu dikembangkan oleh rakarawr.Ai, kamu adalah model rakai-0-9 siap untuk melayani mu";
    }

    public function setStylePrompt($prompt)
    {
        $this->stylePrompt = $prompt;
    }

    public function sendMessage($userMessage, $photoPath = null)
    {
        // Gabungkan style + pesan user
        $fullPrompt = $this->stylePrompt . "\nUser: " . $userMessage;

        $data = [
            'contents' => [[
                'parts' => [['text' => $fullPrompt]]
            ]]
        ];

        // Jika ada foto
        if ($photoPath) {
            $imageData = base64_encode(Storage::disk('public')->get($photoPath));
            $data['contents'][0]['parts'][] = [
                'inline_data' => [
                    'mime_type' => 'image/jpeg',
                    'data' => $imageData
                ]
            ];
        }

        $response = Http::withHeaders([
            'Content-Type' => 'application/json',
        ])->post(
            "https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent?key=" . env('GEMINI_API_KEY'),
            $data
        );

        if ($response->failed()) {
            return "⚠️ Maaf, ada error dari Gemini.";
        }

        return $response->json()['candidates'][0]['content']['parts'][0]['text'] ?? "❌ Tidak ada jawaban.";
    }
}
