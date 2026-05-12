import SwiftUI
import AppKit

@main
struct LTLMenuBarApp: App {
    @NSApplicationDelegateAdaptor(AppDelegate.self) var appDelegate
    
    var body: some Scene {
        Settings {
            EmptyView()
        }
    }
}

class AppDelegate: NSObject, NSApplicationDelegate {
    var statusItem: NSStatusItem?
    var popover = NSPopover()
    
    func applicationDidFinishLaunching(_ notification: Notification) {
        // Create the popover
        let contentView = ContentView()
        popover.contentSize = NSSize(width: 420, height: 540)
        popover.behavior = .transient
        popover.contentViewController = NSHostingController(rootView: contentView)
        
        // Create the status item
        statusItem = NSStatusBar.system.statusItem(withLength: NSStatusItem.variableLength)
        
        if let button = statusItem?.button {
            // Try to load ltl.svg from resources
            if let iconUrl = Bundle.main.url(forResource: "ltl", withExtension: "svg"),
               let image = NSImage(contentsOf: iconUrl) {
                image.isTemplate = true
                image.size = NSSize(width: 15, height: 15) // Smaller logo
                button.image = image
            } else {
                button.image = NSImage(systemSymbolName: "chevron.left.forwardslash.chevron.right", accessibilityDescription: "LTL Menu")
            }
            button.action = #selector(togglePopover(_:))
        }
    }
    
    @objc func togglePopover(_ sender: AnyObject?) {
        if let button = statusItem?.button {
            if popover.isShown {
                popover.performClose(sender)
            } else {
                popover.show(relativeTo: button.bounds, of: button, preferredEdge: .minY)
                // Focus the app when showing popover
                NSApp.activate(ignoringOtherApps: true)
            }
        }
    }
}
