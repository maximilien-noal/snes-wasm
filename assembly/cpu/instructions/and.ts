
import { flags } from '../flags';
import { registers } from '../registers';
import { cpuThread } from '../../scheduler';
import { read_u8, read_u16 } from '../../system-bus';
import { u24_high_u8, u24_low_u16 } from '../../types/u24';
import {
	addr_directPageIndexedIndirectX,
	addr_stackRelative,
	addr_directPage,
	addr_directPageIndirectLong,
	addr_absolute,
	addr_absoluteLong,
	addr_directPageIndirectIndexedY,
	addr_directPageIndirect,
	addr_stackRelativeIndirectIndexedY,
	addr_directPageIndexedX,
	addr_directPageIndirectLongIndexedY,
	addr_absoluteIndexedY,
	addr_absoluteIndexedX,
	addr_absoluteLongIndexedX,
	addr_immediate_u8,
	addr_immediate_u16
} from '../addressing';

/**
 * #### And Accumulator with Memory Instruction (`and`)
 *
 * Perform a bitwise logical AND of the contents at the effective address against the
 * Accumulator. In 8-bit mode (M = 1) or Emulation mode (E = 1), the data from the
 * effective address is 1 byte, and it is OR'ed against the low byte of the Accumulator (A).
 * Otherwise, both the data and Accumulator are 16-bit.
 * 
 *     | OpCode | Syntax       | Addressing                  | Flags     | Bytes | Cycle      |
 *     |--------|--------------|-----------------------------|-----------|-------|------------|
 *     | 0x21   | and (dp,X)   | DP Indexed Indirect, X      | N-----Z-- | 2     | 6 [2],[3]  |
 *     | 0x23   | and sr,S     | Stack Relative              | N-----Z-- | 2     | 4 [2]      |
 *     | 0x25   | and dp       | Direct Page                 | N-----Z-- | 2     | 3 [2],[3]  |
 *     | 0x27   | and [dp]     | DP Indirect Long            | N-----Z-- | 2     | 6 [2],[3]  |
 *     | 0x29   | and #const   | Immediate                   | N-----Z-- | 2[1]  | 2 [2]      |
 *     | 0x2D   | and addr     | Absolute                    | N-----Z-- | 3     | 4 [2]      |
 *     | 0x2F   | and long     | Absolute Long               | N-----Z-- | 4     | 5 [2]      |
 *     | 0x31   | and (dp),Y   | DP Indirect Indexed, Y      | N-----Z-- | 2     | 5 [2],[3]  |
 *     | 0x32   | and (dp)     | DP Indirect                 | N-----Z-- | 2     | 5 [2],[3]  |
 *     | 0x33   | and (sr,S),Y | SR Indirect Indexed, Y      | N-----Z-- | 2     | 7 [2]      |
 *     | 0x35   | and dp,X     | DP Indexed, X               | N-----Z-- | 2     | 4 [2],[3]  |
 *     | 0x37   | and [dp],Y   | DP Indirect Long Indexed, Y | N-----Z-- | 2     | 6 [2],[3]  |
 *     | 0x39   | and addr,Y   | Absolute Indexed,Y          | N-----Z-- | 3     | 4 [2],[4]  |
 *     | 0x3D   | and addr,X   | Absolute Indexed, X         | N-----Z-- | 3     | 4 [2],[4]  |
 *     | 0x3F   | and long,X   | Absolute Long Indexed, X    | N-----Z-- | 4     | 5 [2]      |
 *
 * [1]: Add 1 byte if m = 0 (16-bit memory/accumulator)
 * [2]: Add 1 cycle if m = 0 (16-bit memory/accumulator)
 * [3]: Add 1 cycle if low byte of Direct Page register is not zero
 * [4]: Add 1 cycle if adding index crosses a page boundary
 */
export namespace and {
	/** 0x21 - DP Indexed Indirect, X */
	export function $21() : bool {
		const pointer = addr_directPageIndexedIndirectX();

		and(pointer);

		// Count 6 cycles for the instruction
		cpuThread.countCycles(6);

		return false;
	}

	/** 0x23 - Stack Relative */
	export function $23() : bool {
		const pointer = addr_stackRelative();

		and(pointer);

		// Count 4 cycles for the instruction
		cpuThread.countCycles(4);

		return false;
	}

	/** 0x25 - Direct Page */
	export function $25() : bool {
		const pointer = addr_directPage();

		and(pointer);

		// Count 3 cycles for the instruction
		cpuThread.countCycles(3);

		return false;
	}

	/** 0x27 - DP Indirect Long */
	export function $27() : bool {
		const pointer = addr_directPageIndirectLong();

		and(pointer);

		// Count 6 cycles for the instruction
		cpuThread.countCycles(6);

		return false;
	}

	/** 0x29 - Immediate */
	export function $29() : bool {
		if (flags.E || flags.M) {
			and_u8(addr_immediate_u8());
		}

		else {
			and_u16(addr_immediate_u16());
		}

		// Count 2 cycles for the instruction
		cpuThread.countCycles(2);

		return false;
	}

	/** 0x2D - Absolute */
	export function $2D() : bool {
		const pointer = addr_absolute();

		and(pointer);

		// Count 4 cycles for the instruction
		cpuThread.countCycles(4);

		return false;
	}

	/** 0x2F - Absolute Long */
	export function $2F() : bool {
		const pointer = addr_absoluteLong();

		and(pointer);

		// Count 5 cycles for the instruction
		cpuThread.countCycles(5);

		return false;
	}

	/** 0x31 - DP Indirect Indexed, Y */
	export function $31() : bool {
		const pointer = addr_directPageIndirectIndexedY();

		and(pointer);

		// Count 5 cycles for the instruction
		cpuThread.countCycles(5);

		return false;
	}

	/** 0x32 - DP Indirect */
	export function $32() : bool {
		const pointer = addr_directPageIndirect();

		and(pointer);

		// Count 5 cycles for the instruction
		cpuThread.countCycles(5);

		return false;
	}

	/** 0x33 - SR Indirect Indexed, Y */
	export function $33() : bool {
		const pointer = addr_stackRelativeIndirectIndexedY();

		and(pointer);

		// Count 7 cycles for the instruction
		cpuThread.countCycles(7);

		return false;
	}

	/** 0x35 - DP Indexed, X */
	export function $35() : bool {
		const pointer = addr_directPageIndexedX();

		and(pointer);

		// Count 4 cycles for the instruction
		cpuThread.countCycles(4);

		return false;
	}

	/** 0x37 - DP Indirect Long Indexed, Y */
	export function $37() : bool {
		const pointer = addr_directPageIndirectLongIndexedY();

		and(pointer);

		// Count 6 cycles for the instruction
		cpuThread.countCycles(6);

		return false;
	}

	/** 0x39 - Absolute Indexed,Y */
	export function $39() : bool {
		const pointer = addr_absoluteIndexedY();

		and(pointer);

		// Count 4 cycles for the instruction
		cpuThread.countCycles(4);

		return false;
	}

	/** 0x3D - Absolute Indexed, X */
	export function $3D() : bool {
		const pointer = addr_absoluteIndexedX();

		and(pointer);

		// Count 4 cycles for the instruction
		cpuThread.countCycles(4);

		return false;
	}

	/** 0x3F - Absolute Long Indexed, X */
	export function $3F() : bool {
		const pointer = addr_absoluteLongIndexedX();

		and(pointer);

		// Count 5 cycles for the instruction
		cpuThread.countCycles(5);

		return false;
	}





	// ===== Actual Implementation =====

	function and(pointer: u32) : void {
		const bank = u24_high_u8(pointer);
		const addr = u24_low_u16(pointer);

		if (flags.E || flags.M) {
			and_u8(read_u8(bank, addr));
		}

		else {
			and_u16(read_u16(bank, addr));
		}
	}

	// @ts-ignore: decorator
	@inline function and_u8(operand: u8) : void {
		registers.A &= operand;
	}

	// @ts-ignore: decorator
	@inline function and_u16(operand: u16) : void {
		registers.C &= operand;

		// Count 1 extra cycle for 16-bit mode
		cpuThread.countCycles(1);
	}

}