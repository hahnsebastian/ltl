import SwiftUI

struct ComposeView: View {
    @State private var input = ""
    @State private var selectedMode = "draft"
    @State private var messages: [ChatMessage] = []
    @ObservedObject var forwarder: APIForwarder
    
    // Settings for forwarding
    let apiKey: String?
    let provider: LLMProvider
    let model: String
    let autoForward: Bool
    let customUrl: String?
    
    @State private var useLTL = true // true = LTL Compress, false = Just Chat
    
    @State private var blobOffset1 = CGSize(width: -100, height: -100)
    @State private var blobOffset2 = CGSize(width: 100, height: 100)
    
    struct ChatMessage: Identifiable {
        let id = UUID()
        let text: String
        let isUser: Bool
    }
    
    var body: some View {
        ZStack {
            // Liquid Background Blobs
            ZStack {
                Circle()
                    .fill(Color.accentColor.opacity(0.15))
                    .frame(width: 300, height: 300)
                    .blur(radius: 80)
                    .offset(blobOffset1)
                
                Circle()
                    .fill(Color.purple.opacity(0.1))
                    .frame(width: 250, height: 250)
                    .blur(radius: 60)
                    .offset(blobOffset2)
            }
            .onAppear {
                withAnimation(.linear(duration: 20).repeatForever(autoreverses: true)) {
                    blobOffset1 = CGSize(width: 100, height: 150)
                    blobOffset2 = CGSize(width: -120, height: -80)
                }
            }
            
            VStack(spacing: 0) {
                // Chat History
                ScrollViewReader { proxy in
                    ScrollView {
                        VStack(alignment: .leading, spacing: 20) {
                            if messages.isEmpty {
                                VStack(spacing: 12) {
                                    Image(systemName: "sparkles")
                                        .font(.system(size: 40, weight: .thin))
                                        .foregroundStyle(.secondary)
                                    Text("Speak to LTL")
                                        .font(.system(size: 16, weight: .medium))
                                        .foregroundColor(.secondary)
                                }
                                .frame(maxWidth: .infinity)
                                .padding(.top, 140)
                            }
                            
                            ForEach(messages) { msg in
                                ChatBubble(message: msg)
                                    .transition(.asymmetric(insertion: .move(edge: .bottom).combined(with: .opacity), removal: .opacity))
                            }
                            
                            if !forwarder.responseText.isEmpty {
                                ChatBubble(message: ChatMessage(text: forwarder.responseText, isUser: false))
                            }
                        }
                        .padding(24)
                    }
                    .onChange(of: messages.count) { _ in
                        withAnimation(.interactiveSpring(response: 0.5, dampingFraction: 0.8)) {
                            proxy.scrollTo(messages.last?.id, anchor: .bottom)
                        }
                    }
                }
                
                // Bottom Input Area
                VStack(spacing: 12) {
                    HStack(alignment: .center, spacing: 12) {
                        TextField("Type something...", text: $input, axis: .vertical)
                            .textFieldStyle(.plain)
                            .font(.system(size: 14))
                            .lineLimit(1...5)
                            .padding(12)
                            .liquidGlass(cornerRadius: 18, opacity: 0.6) // Using custom modifier
                            .onSubmit {
                                if !input.isEmpty { sendMessage() }
                            }
                        
                        Button(action: sendMessage) {
                            Image(systemName: "arrow.up.circle.fill")
                                .font(.system(size: 34))
                                .symbolRenderingMode(.hierarchical)
                                .foregroundStyle(input.isEmpty ? .secondary : Color.accentColor)
                                .shadow(color: .black.opacity(0.1), radius: 2, y: 1)
                        }
                        .buttonStyle(.plain)
                        .disabled(input.isEmpty)
                    }
                    
                    HStack {
                        Picker("", selection: $useLTL) {
                            Text("Just Chat").tag(false)
                            Text("LTL Compress").tag(true)
                        }
                        .pickerStyle(.segmented)
                        .frame(width: 200)
                        
                        Spacer()
                        
                        if let key = apiKey, !key.isEmpty {
                            HStack(spacing: 4) {
                                Circle()
                                    .fill(Color.green)
                                    .frame(width: 6, height: 6)
                                Text(model.uppercased())
                                    .font(.system(size: 10, weight: .bold))
                                    .foregroundColor(.secondary)
                            }
                            .padding(.horizontal, 8)
                            .padding(.vertical, 4)
                            .background(.ultraThinMaterial)
                            .clipShape(Capsule())
                        }
                    }
                }
                .padding(20)
                .background(.regularMaterial)
                .overlay(Rectangle().frame(height: 0.5).foregroundColor(.white.opacity(0.1)), alignment: .top)
            }
        }
    }
    
    private func sendMessage() {
        let userMsg = input
        messages.append(ChatMessage(text: userMsg, isUser: true))
        input = ""
        
        let finalPrompt: String
        if useLTL {
            let (expanded, _) = LTLEngine.shared.process(input: userMsg, mode: "compress")
            finalPrompt = expanded
        } else {
            finalPrompt = userMsg
        }
        
        if autoForward, let key = apiKey, !key.isEmpty {
            forwarder.send(prompt: finalPrompt, provider: provider, model: model, apiKey: key, customUrl: customUrl)
        } else if useLTL {
            messages.append(ChatMessage(text: finalPrompt, isUser: false))
        }
    }
}

struct ChatBubble: View {
    let message: ComposeView.ChatMessage
    
    var body: some View {
        HStack {
            if message.isUser { Spacer() }
            
            VStack(alignment: message.isUser ? .trailing : .leading, spacing: 6) {
                Text(message.text)
                    .font(.system(size: 14.5))
                    .padding(.horizontal, 16)
                    .padding(.vertical, 12)
                    .background(
                        ZStack {
                            if message.isUser {
                                Color.accentColor.opacity(0.7)
                            } else {
                                Color.white.opacity(0.05)
                            }
                        }
                    )
                    .liquidGlass(cornerRadius: 18) // Using custom modifier
                    .foregroundColor(message.isUser ? .white : .primary)
                    .textSelection(.enabled)
                
                Text(message.isUser ? "YOU" : "LTL ENGINE")
                    .font(.system(size: 9, weight: .bold))
                    .tracking(0.5)
                    .foregroundColor(.secondary)
                    .padding(.horizontal, 8)
            }
            
            if !message.isUser { Spacer() }
        }
    }
}
