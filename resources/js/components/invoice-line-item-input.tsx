import React, { useState, useRef, useEffect } from 'react';
import { Input } from '@/components/ui/input';
import { Command, CommandEmpty, CommandGroup, CommandItem, CommandList } from '@/components/ui/command';

interface Tier {
  id: number;
  name: string;
  description?: string;
  price: string | number;
  billing_period?: string;
}

interface InvoiceLineItemInputProps {
  value: string;
  price: string;
  onDescriptionChange: (description: string) => void;
  onPriceChange: (price: string) => void;
  membershipTiers?: Tier[];
  tuitionTiers?: Tier[];
  placeholder?: string;
  className?: string;
  id?: string;
}

export function InvoiceLineItemInput({
  value,
  price,
  onDescriptionChange,
  onPriceChange,
  membershipTiers = [],
  tuitionTiers = [],
  placeholder = "Start typing to search tiers or enter custom description",
  className,
  id,
}: Readonly<InvoiceLineItemInputProps>) {
  const [isOpen, setIsOpen] = useState(false);
  const [search, setSearch] = useState(value);
  const inputRef = useRef<HTMLInputElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);

  // Sync search with value when value changes externally
  useEffect(() => {
    setSearch(value);
  }, [value]);

  // Close dropdown when clicking outside
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (containerRef.current && !containerRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    }

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // Filter tiers based on search
  const filteredMembershipTiers = membershipTiers.filter(tier =>
    tier.name.toLowerCase().includes(search.toLowerCase()) ||
    (tier.description?.toLowerCase().includes(search.toLowerCase()) ?? false)
  );

  const filteredTuitionTiers = tuitionTiers.filter(tier =>
    tier.name.toLowerCase().includes(search.toLowerCase()) ||
    (tier.description?.toLowerCase().includes(search.toLowerCase()) ?? false)
  );

  const showDropdown = isOpen && (filteredMembershipTiers.length > 0 || filteredTuitionTiers.length > 0);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newValue = e.target.value;
    setSearch(newValue);
    onDescriptionChange(newValue);
    setIsOpen(true);
  };

  const handleSelectTier = (tier: Tier) => {
    const description = tier.billing_period 
      ? `${tier.name} (${tier.billing_period})`
      : tier.name;
    
    setSearch(description);
    onDescriptionChange(description);
    onPriceChange(tier.price.toString());
    setIsOpen(false);
  };

  const handleInputFocus = () => {
    setIsOpen(true);
  };

  const handleInputBlur = () => {
    // Delay closing to allow click events on dropdown items
    setTimeout(() => {
      if (!containerRef.current?.contains(document.activeElement)) {
        setIsOpen(false);
      }
    }, 200);
  };

  return (
    <div ref={containerRef} className="relative">
      <Input
        ref={inputRef}
        id={id}
        type="text"
        value={search}
        onChange={handleInputChange}
        onFocus={handleInputFocus}
        onBlur={handleInputBlur}
        placeholder={placeholder}
        className={className}
        autoComplete="off"
      />
      
      {showDropdown && (
        <div className="absolute z-50 w-full mt-1 bg-white dark:bg-gray-950 border rounded-md shadow-lg max-h-[300px] overflow-hidden">
          <Command shouldFilter={false}>
            <CommandList>
              {filteredMembershipTiers.length === 0 && filteredTuitionTiers.length === 0 && (
                <CommandEmpty>No tiers found. Continue typing for custom description.</CommandEmpty>
              )}
              
              {filteredMembershipTiers.length > 0 && (
                <CommandGroup heading="Membership Tiers">
                  {filteredMembershipTiers.map((tier) => (
                    <CommandItem
                      key={`membership-${tier.id}`}
                      value={tier.name}
                      onSelect={() => handleSelectTier(tier)}
                    >
                      <div className="flex flex-col flex-1">
                        <div className="flex items-center justify-between">
                          <span className="font-medium">{tier.name}</span>
                          <span className="text-sm text-gray-600 dark:text-gray-400">
                            ${Number.parseFloat(tier.price.toString()).toFixed(2)}
                            {tier.billing_period && ` / ${tier.billing_period}`}
                          </span>
                        </div>
                        {tier.description && (
                          <span className="text-xs text-gray-500 dark:text-gray-500">
                            {tier.description}
                          </span>
                        )}
                      </div>
                    </CommandItem>
                  ))}
                </CommandGroup>
              )}

              {filteredTuitionTiers.length > 0 && (
                <CommandGroup heading="Tuition Tiers">
                  {filteredTuitionTiers.map((tier) => (
                    <CommandItem
                      key={`tuition-${tier.id}`}
                      value={tier.name}
                      onSelect={() => handleSelectTier(tier)}
                    >
                      <div className="flex flex-col flex-1">
                        <div className="flex items-center justify-between">
                          <span className="font-medium">{tier.name}</span>
                          <span className="text-sm text-gray-600 dark:text-gray-400">
                            ${Number.parseFloat(tier.price.toString()).toFixed(2)}
                            {tier.billing_period && ` / ${tier.billing_period}`}
                          </span>
                        </div>
                        {tier.description && (
                          <span className="text-xs text-gray-500 dark:text-gray-500">
                            {tier.description}
                          </span>
                        )}
                      </div>
                    </CommandItem>
                  ))}
                </CommandGroup>
              )}
            </CommandList>
          </Command>
        </div>
      )}
    </div>
  );
}
