import SwiftUI
import ServiceManagement

struct SettingsView: View {
    @Binding var apiKey: String
    @Binding var selectedProvider: LLMProvider
    @Binding var model: String
    @Binding var autoForward: Bool
    @Binding var customUrl: String
    @State private var launchAtLogin = false
    
    var body: some View {
        Form {
            Section {
                VStack(alignment: .leading, spacing: 4) {
                    Text("API KEY")
                        .font(.system(size: 10, weight: .bold))
                        .foregroundColor(.secondary)
                    SecureField("", text: $apiKey)
                        .textFieldStyle(.roundedBorder)
                        .onChange(of: apiKey) { newValue in
                            KeychainHelper.shared.save(newValue, account: "default")
                        }
                }
                .padding(.vertical, 4)
                
                Text("Optional — for LLM forwarding. Stored in macOS Keychain.")
                    .font(.system(size: 10))
                    .foregroundColor(.secondary)
                
                Button("Clear API Key", role: .destructive) {
                    apiKey = ""
                    KeychainHelper.shared.delete(account: "default")
                }
                .buttonStyle(.borderless)
            } header: {
                Text("AUTHENTICATION").font(.system(size: 10, weight: .bold))
            }
            
            Section {
                Picker("Provider", selection: $selectedProvider) {
                    ForEach(LLMProvider.allCases) { provider in
                        Text(provider.rawValue).tag(provider)
                    }
                }
                .onChange(of: selectedProvider) { newValue in
                    model = newValue.defaultModel
                }
                
                if selectedProvider == .custom {
                    TextField("Base URL", text: $customUrl)
                }
                
                TextField("Model ID", text: $model)
            } header: {
                Text("MODEL CONFIGURATION").font(.system(size: 10, weight: .bold))
            }
            
            Section {
                Toggle("Auto-Forward Prompt", isOn: $autoForward)
                Toggle("Launch at Login", isOn: $launchAtLogin)
            } header: {
                Text("AUTOMATION").font(.system(size: 10, weight: .bold))
            }
        }
        .formStyle(.grouped)
        .padding(.horizontal, 10)
        .onAppear {
            apiKey = KeychainHelper.shared.read(account: "default") ?? ""
            // Launch at login status could be checked here but requires SMAppService.status
        }
    }
    
    private func toggleLaunchAtLogin(_ enabled: Bool) {
        do {
            if enabled {
                try SMAppService.mainApp.register()
            } else {
                try SMAppService.mainApp.unregister()
            }
        } catch {
            print("Failed to toggle launch at login: \(error)")
        }
    }
}
