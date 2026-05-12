import SwiftUI

struct ContentView: View {
    @State private var selectedTab = 0
    @StateObject private var forwarder = APIForwarder()
    
    // Persistent settings
    @AppStorage("selectedProvider") private var providerRaw = LLMProvider.openAI.rawValue
    @AppStorage("model") private var model = "gpt-4o"
    @AppStorage("autoForward") private var autoForward = false
    @AppStorage("customUrl") private var customUrl = ""
    @State private var apiKey = ""
    
    var selectedProvider: LLMProvider {
        LLMProvider(rawValue: providerRaw) ?? .openAI
    }
    
    var body: some View {
        ZStack {
            // Liquid Glass Background
            VisualEffectView(material: .hudWindow, blendingMode: .withinWindow)
                .ignoresSafeArea()
            
            VStack(spacing: 0) {
                // Top Tab Switcher
                HStack {
                    Picker("", selection: $selectedTab) {
                        Text("Compose").tag(0)
                        Text("Reference").tag(1)
                        Text("Settings").tag(2)
                    }
                    .pickerStyle(.segmented)
                    .frame(width: 280)
                }
                .frame(maxWidth: .infinity)
                .padding(.vertical, 16)
                
                Divider().opacity(0.1)
                
                // Content
                ZStack {
                    if selectedTab == 0 {
                        ComposeView(
                            forwarder: forwarder,
                            apiKey: apiKey,
                            provider: selectedProvider,
                            model: model,
                            autoForward: autoForward,
                            customUrl: customUrl
                        )
                    } else if selectedTab == 1 {
                        ReferenceView()
                    } else {
                        SettingsView(
                            apiKey: $apiKey,
                            selectedProvider: Binding(
                                get: { selectedProvider },
                                set: { providerRaw = $0.rawValue }
                            ),
                            model: $model,
                            autoForward: $autoForward,
                            customUrl: $customUrl
                        )
                    }
                }
                .frame(maxWidth: .infinity, maxHeight: .infinity)
            }
        }
        .frame(width: 420, height: 540)
        .font(.system(.body)) // Standard Apple Font
        .onAppear {
            apiKey = KeychainHelper.shared.read(account: "default") ?? ""
        }
    }
}

struct VisualEffectView: NSViewRepresentable {
    let material: NSVisualEffectView.Material
    let blendingMode: NSVisualEffectView.BlendingMode
    
    func makeNSView(context: Context) -> NSVisualEffectView {
        let view = NSVisualEffectView()
        view.material = material
        view.blendingMode = blendingMode
        view.state = .active
        return view
    }
    
    func updateNSView(_ nsView: NSVisualEffectView, context: Context) {
        nsView.material = material
        nsView.blendingMode = blendingMode
    }
}
