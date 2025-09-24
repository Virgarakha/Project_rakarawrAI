<?php
namespace App\Http\Controllers;
use App\Models\Chat;
use App\Models\Message;
use App\Services\GeminiService;
use Illuminate\Http\Request;

class ChatController extends Controller
{
    protected $gemini;

    public function __construct(GeminiService $gemini) {
        $this->gemini = $gemini;
    }

public function index(Request $request) {
    return Chat::where('user_id', $request->user()->id)
               ->orderBy('created_at', 'desc') // terbaru dulu
               ->get();
}


    public function show($id, Request $request) {
        $chat = Chat::where('user_id', $request->user()->id)->findOrFail($id);
        return $chat->messages;
    }

public function sendMessage(Request $request, $id)
{
    $chat = Chat::findOrFail($id);
    $user = auth()->user(); // Get the authenticated user
    $userPlan = $user->plan; // Assuming plan is stored in the user model

    // Count total messages in the chat for the user
    $messageCount = Message::where('chat_id', $chat->id)->count();

    // Check message limits based on user plan
    if ($userPlan === 'Pro' && $messageCount >= 100) {
        return response()->json([
            'error' => 'You have reached the message limit of 100 for Pro plan in this chat.'
        ], 403);
    } elseif ($userPlan === 'Free' && $messageCount >= 10) {
        return response()->json([
            'error' => 'You have reached the message limit of 10 for Free plan in this chat.'
        ], 403);
    } elseif ($userPlan !== 'Premium' && $userPlan !== 'Pro' && $userPlan !== 'Free') {
        return response()->json([
            'error' => 'Invalid user plan.'
        ], 403);
    }

    $photoPath = null;
    if ($request->hasFile('photo')) {
        $photoPath = $request->file('photo')->store('photos', 'public');
    }

    $userMessage = Message::create([
        'chat_id' => $chat->id,
        'sender' => 'user',
        'message' => $request->input('message', ''),
        'photo_path' => $photoPath,
    ]);

    $history = Message::where('chat_id', $chat->id)
        ->orderBy('created_at', 'desc')
        ->take(10)
        ->get()
        ->reverse();

    $prompt = "Kamu adalah asisten ramah.\n\nHistory chat:\n";
    foreach ($history as $msg) {
        $role = $msg->sender === 'user' ? 'User' : 'Assistant';
        $content = $msg->message;
        if ($msg->photo_path) {
            $content .= " [Photo: {$msg->photo_path}]";
        }
        $prompt .= "{$role}: {$content}\n";
    }

    $aiReply = $this->gemini->sendMessage($prompt, $photoPath);

    $aiMessage = Message::create([
        'chat_id' => $chat->id,
        'sender' => 'ai',
        'message' => $aiReply,
        'photo_path' => null, // AI tidak mengunggah foto
    ]);

    return response()->json([
        'user' => $userMessage->fresh(), // Mengambil data terbaru termasuk photo_path
        'ai' => $aiMessage->fresh(),    // Mengambil data terbaru termasuk photo_path
    ]);
}
    public function createChat(Request $request) {
        $chat = Chat::create([
            'user_id' => $request->user()->id,
            'title' => $request->input('title', 'Chat Baru'),
        ]);
        return $chat;
    }

    public function updateChat(Request $request, $id) {
        $chat = Chat::where('user_id', $request->user()->id)->findOrFail($id);

        $chat->update([
            'title' => $request->input('title')
        ]);

        return response()->json([
            'success' => true,
            'message' => 'Chat title updated successfully',
            'chat' => $chat
        ]);
    }

    public function deleteChat(Request $request, $id) {
        $chat = Chat::where('user_id', $request->user()->id)->findOrFail($id);

        $chat->messages()->delete();

        $chat->delete();

        return response()->json([
            'success' => true,
            'message' => 'Chat deleted successfully'
        ]);
    }
}
