# CDK Components

## CDKModal

A generic modal component for displaying iframes with customizable properties.

### Usage

```tsx
import CDKModal from './components/CDKModal';

// Basic usage
<CDKModal
  isOpen={isModalOpen}
  onClose={closeModal}
  iframeUrl="https://example.com"
  title="My Modal"
/>

// Advanced usage with custom props
<CDKModal
  isOpen={isModalOpen}
  onClose={closeModal}
  iframeUrl="https://example.com"
  title="Custom Modal"
  width="max-w-6xl"
  height="h-[600px]"
  showFooter={false}
  footerActions={
    <button onClick={handleCustomAction}>
      Custom Action
    </button>
  }
/>
```

### Props

- `isOpen: boolean` - Controls modal visibility
- `onClose: () => void` - Function to close the modal
- `iframeUrl: string` - URL to display in the iframe
- `title?: string` - Modal title (default: "Modal")
- `width?: string` - Modal width CSS class (default: "max-w-4xl")
- `height?: string` - Iframe height CSS class (default: "h-96")
- `showFooter?: boolean` - Show/hide footer (default: true)
- `footerActions?: React.ReactNode` - Custom footer content

### Examples

#### CDK Flow Modal
```tsx
<CDKModal
  isOpen={isModalOpen}
  onClose={closeModal}
  iframeUrl={flowUrl}
  title="CDK Flow"
  footerActions={
    <>
      <button onClick={closeModal}>Cancel</button>
      <button onClick={handleFlowAction}>Complete</button>
    </>
  }
/>
```

#### Full Screen Modal
```tsx
<CDKModal
  isOpen={isModalOpen}
  onClose={closeModal}
  iframeUrl={url}
  title="Full Screen Content"
  width="max-w-7xl"
  height="h-[80vh]"
/>
```

#### No Footer Modal
```tsx
<CDKModal
  isOpen={isModalOpen}
  onClose={closeModal}
  iframeUrl={url}
  title="Content Only"
  showFooter={false}
/>
```

## CDKDevToolWrapper

A wrapper component that manages the state between the CDK flow configuration and iframe display.

## IframeDisplay

A component for displaying CDK flow iframes with placeholder state.

## CDKFlowDevTool

The main developer tool component that handles CDK flow configuration, form submission, and event logging.
