import Foundation

struct LTLError: Identifiable {
    let id = UUID()
    let range: NSRange
    let message: String
}

class LTLEngine {
    static let shared = LTLEngine()
    
    private var variables: [String: String] = [:]
    
    func process(input: String, mode: String = ">>draft") -> (expanded: String, errors: [LTLError]) {
        variables.removeAll()
        var currentText = input
        var errors: [LTLError] = []
        
        // 1. Extract and Resolve Variables
        // Pattern: $var = value (handling all types mentioned in spec)
        let varPattern = #"\$([a-zA-Z0-9_]+)\s*=\s*(.*?)(?=\n|$)"#
        let varRegex = try! NSRegularExpression(pattern: varPattern, options: [])
        let varMatches = varRegex.matches(in: currentText, options: [], range: NSRange(location: 0, length: currentText.utf16.count))
        
        for match in varMatches.reversed() {
            let varNameRange = match.range(at: 1)
            let varValueRange = match.range(at: 2)
            
            if let varName = Range(varNameRange, in: currentText),
               let varValue = Range(varValueRange, in: currentText) {
                let name = String(currentText[varName])
                let value = String(currentText[varValue]).trimmingCharacters(in: .whitespaces)
                
                if value == "?" {
                    variables[name] = "[INPUT REQUIRED]"
                } else if value == "null" {
                    variables[name] = ""
                } else {
                    variables[name] = value.replacingOccurrences(of: "\"", with: "")
                }
                
                // Remove the declaration from the final prompt
                if let fullRange = Range(match.range, in: currentText) {
                    currentText.removeSubrange(fullRange)
                }
            }
        }
        
        // 2. Expand Variables in Text
        for (name, value) in variables {
            currentText = currentText.replacingOccurrences(of: "$\(name)", with: value)
        }
        
        // 3. Expand Domain Tags
        for (tag, expansions) in ReferenceData.domainExpansions {
            if currentText.contains(tag) {
                let expansionString = " [Keywords: \(expansions.joined(separator: ", "))]"
                currentText = currentText.replacingOccurrences(of: tag, with: tag + expansionString)
            }
        }
        
        // 4. Syntax Validation (Basic)
        // Check for common sigils and flag unknown ones starting with ! or @ or > or #
        let sigilPattern = #"(?<!\w)([@!#>#~?]|->|&&|//|<<|>>|\$|:)[a-zA-Z0-9\-_:]*"#
        let sigilRegex = try! NSRegularExpression(pattern: sigilPattern, options: [])
        let allSigils = sigilRegex.matches(in: input, options: [], range: NSRange(location: 0, length: input.utf16.count))
        
        let knownSigils = Set(ReferenceData.sections.flatMap { $0.items.map { $0.syntax.lowercased() } })
        
        for match in allSigils {
            let fullSigil = (input as NSString).substring(with: match.range).lowercased()
            // Check if the prefix or the full command is known
            let baseSigil = ReferenceData.sections[0].items.first { fullSigil.starts(with: $0.syntax.lowercased()) }?.syntax.lowercased()
            
            if baseSigil == nil {
                errors.append(LTLError(range: match.range, message: "Unknown sigil: \(fullSigil)"))
            }
        }
        
        // 5. Apply Execution Mode (Simulation for local assembly)
        let finalPrompt = """
        [LTL Mode: \(mode.replacingOccurrences(of: ">>", with: "").uppercased())]
        \(currentText.trimmingCharacters(in: .whitespacesAndNewlines))
        """
        
        return (finalPrompt, errors)
    }
}
