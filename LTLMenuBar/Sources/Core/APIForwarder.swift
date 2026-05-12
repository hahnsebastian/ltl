import Foundation

enum LLMProvider: String, CaseIterable, Identifiable {
    case openAI = "OpenAI"
    case anthropic = "Anthropic"
    case mistral = "Mistral"
    case custom = "Custom"
    
    var id: String { self.rawValue }
    
    var defaultModel: String {
        switch self {
        case .openAI: return "gpt-4o"
        case .anthropic: return "claude-3-5-sonnet-20240620"
        case .mistral: return "mistral-large-latest"
        case .custom: return ""
        }
    }
    
    var baseUrl: String {
        switch self {
        case .openAI: return "https://api.openai.com/v1/chat/completions"
        case .anthropic: return "https://api.anthropic.com/v1/messages"
        case .mistral: return "https://api.mistral.ai/v1/chat/completions"
        case .custom: return ""
        }
    }
}

class APIForwarder: NSObject, ObservableObject, URLSessionDataDelegate {
    @Published var responseText = ""
    @Published var isStreaming = false
    
    private var session: URLSession?
    private var task: URLSessionDataTask?
    
    func send(prompt: String, provider: LLMProvider, model: String, apiKey: String, customUrl: String? = nil) {
        self.responseText = ""
        self.isStreaming = true
        
        let urlString = provider == .custom ? (customUrl ?? "") : provider.baseUrl
        guard let url = URL(string: urlString) else {
            self.responseText = "Error: Invalid URL"
            self.isStreaming = false
            return
        }
        
        var request = URLRequest(url: url)
        request.httpMethod = "POST"
        request.setValue("application/json", forHTTPHeaderField: "Content-Type")
        
        // Auth headers
        switch provider {
        case .openAI, .mistral, .custom:
            request.setValue("Bearer \(apiKey)", forHTTPHeaderField: "Authorization")
        case .anthropic:
            request.setValue(apiKey, forHTTPHeaderField: "x-api-key")
            request.setValue("2023-06-01", forHTTPHeaderField: "anthropic-version")
        }
        
        // Payload construction
        var payload: [String: Any] = [:]
        if provider == .anthropic {
            payload = [
                "model": model,
                "messages": [["role": "user", "content": prompt]],
                "max_tokens": 4096,
                "stream": true
            ]
        } else {
            payload = [
                "model": model,
                "messages": [["role": "user", "content": prompt]],
                "stream": true
            ]
        }
        
        request.httpBody = try? JSONSerialization.data(withJSONObject: payload)
        
        let config = URLSessionConfiguration.default
        session = URLSession(configuration: config, delegate: self, delegateQueue: .main)
        task = session?.dataTask(with: request)
        task?.resume()
    }
    
    func urlSession(_ session: URLSession, dataTask: URLSessionDataTask, didReceive data: Data) {
        if let chunk = String(data: data, encoding: .utf8) {
            // Very basic SSE parsing for OpenAI/Anthropic/Mistral
            let lines = chunk.components(separatedBy: "\n")
            for line in lines {
                if line.hasPrefix("data: ") {
                    let jsonString = line.dropFirst(6).trimmingCharacters(in: .whitespaces)
                    if jsonString == "[DONE]" { continue }
                    
                    if let jsonData = jsonString.data(using: .utf8),
                       let json = try? JSONSerialization.jsonObject(with: jsonData) as? [String: Any] {
                        
                        // OpenAI/Mistral style
                        if let choices = json["choices"] as? [[String: Any]],
                           let delta = choices.first?["delta"] as? [String: Any],
                           let content = delta["content"] as? String {
                            self.responseText += content
                        }
                        
                        // Anthropic style
                        if let type = json["type"] as? String, type == "content_block_delta",
                           let delta = json["delta"] as? [String: Any],
                           let text = delta["text"] as? String {
                            self.responseText += text
                        }
                    }
                }
            }
        }
    }
    
    func urlSession(_ session: URLSession, task: URLSessionTask, didCompleteWithError error: Error?) {
        DispatchQueue.main.async {
            self.isStreaming = false
            if let error = error {
                self.responseText += "\n[Error: \(error.localizedDescription)]"
            }
        }
    }
}
