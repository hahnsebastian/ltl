import SwiftUI

struct ReferenceView: View {
    @State private var searchText = ""
    @State private var copiedText: String? = nil
    
    var filteredSections: [LTLSection] {
        if searchText.isEmpty {
            return ReferenceData.sections
        } else {
            return ReferenceData.sections.compactMap { section in
                let filteredItems = section.items.filter {
                    $0.syntax.localizedCaseInsensitiveContains(searchText) ||
                    $0.name.localizedCaseInsensitiveContains(searchText) ||
                    $0.description.localizedCaseInsensitiveContains(searchText)
                }
                return filteredItems.isEmpty ? nil : LTLSection(title: section.title, items: filteredItems)
            }
        }
    }
    
    var body: some View {
        VStack(spacing: 0) {
            // Search Bar
            TextField("Search Reference...", text: $searchText)
                .textFieldStyle(.plain)
                .padding(12)
                .background(Color.black.opacity(0.3))
                .cornerRadius(8)
                .padding(.horizontal, 20)
                .padding(.top, 15) // Reduced from 20
                .padding(.bottom, 10)
            
            List {
                ForEach(filteredSections) { section in
                    DisclosureGroup(section.title) {
                        ForEach(section.items) { item in
                            ReferenceRow(item: item) {
                                copy(item.syntax)
                            }
                        }
                    }
                    .font(.system(size: 13, weight: .semibold))
                    .foregroundColor(.primary)
                }
            }
            .listStyle(.sidebar)
            
            if let copied = copiedText {
                Text("Copied '\(copied)'!")
                    .font(.system(size: 12))
                    .padding(8)
                    .background(Color.primary.opacity(0.1))
                    .cornerRadius(8)
                    .transition(.move(edge: .bottom).combined(with: .opacity))
                    .padding(.bottom, 8)
            }
        }
    }
    
    private func copy(_ text: String) {
        NSPasteboard.general.clearContents()
        NSPasteboard.general.setString(text, forType: .string)
        withAnimation {
            copiedText = text
        }
        DispatchQueue.main.asyncAfter(deadline: .now() + 1.5) {
            withAnimation {
                copiedText = nil
            }
        }
    }
}

struct ReferenceRow: View {
    let item: LTLReferenceItem
    let action: () -> Void
    
    var body: some View {
        Button(action: action) {
            VStack(alignment: .leading, spacing: 4) {
                HStack {
                    Text(item.syntax)
                        .font(.system(.body, design: .monospaced))
                        .fontWeight(.bold)
                    Spacer()
                    Text(item.name)
                        .font(.system(size: 11))
                        .foregroundColor(.secondary)
                }
                
                Text(item.description)
                    .font(.system(size: 12))
                    .foregroundColor(.secondary)
                    .lineLimit(2)
                
                Text("Example: \(item.example)")
                    .font(.system(size: 11, design: .monospaced))
                    .foregroundColor(.primary.opacity(0.6))
            }
            .padding(.vertical, 4)
            .contentShape(Rectangle())
        }
        .buttonStyle(.plain)
    }
}
