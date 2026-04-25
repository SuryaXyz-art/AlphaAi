import { BlankButton } from "../components/ui/BlankButton";
import { BlankInput } from "../components/ui/BlankInput";
import { PageHeader } from "../components/ui/PageHeader";

export function Pay() {
  return (
    <div className="p-6 space-y-6">
      <PageHeader title="Send Payment" />
      
      <div className="space-y-4">
        <BlankInput 
          label="Recipient Address" 
          placeholder="0x..." 
        />
        <BlankInput 
          label="Amount (USDC)" 
          placeholder="0.00" 
          type="number"
        />
      </div>

      <div className="absolute bottom-6 left-6 right-6">
        <BlankButton size="full">
          Confirm Send
        </BlankButton>
      </div>
    </div>
  );
}
