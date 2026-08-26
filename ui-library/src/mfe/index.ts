// Module Federation requires shared-scope init before any eager import runs,
// so the real entry is loaded dynamically rather than imported at the top level.
import("./bootstrap");
