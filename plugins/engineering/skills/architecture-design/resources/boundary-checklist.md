# Boundary checklist

Applied to every boundary the change creates or moves.

## Ownership

- [ ] Exactly one module writes each table or collection touched.
- [ ] Every business rule has one owner, named.
- [ ] No rule is enforced in two layers with two implementations.
- [ ] The authorization decision has one home, not three.
- [ ] Shared code is shared because it is one concept, not because two call
      sites happened to look alike.

## Contract

- [ ] Input shape is declared, including which fields are required.
- [ ] Identifiers in the input are checked for ownership, not just for format.
- [ ] Output shape is declared, including the error shape.
- [ ] Status codes or result variants are enumerated.
- [ ] The caller knows which failures it must handle.
- [ ] Backward compatibility of the contract is stated: additive, breaking, or
      versioned.

## Dependency direction

- [ ] The direction is written down as an ordered list of packages or
      modules, each naming what it may import.
- [ ] A check in the pipeline enforces it and fails the build on a reversed
      import; existing violations are its only listed exceptions.
- [ ] Dependencies point one way. Cycles are named and broken.
- [ ] The domain does not import the transport layer.
- [ ] The data layer does not import the handler layer.
- [ ] A shared package does not import an application.
- [ ] No module reaches into another module's internal files.

## Failure model

- [ ] Every outbound call has a timeout, with the value written down.
- [ ] Retry policy is bounded and only applied to idempotent operations.
- [ ] Permanent failure behaviour is chosen: fail closed, fail open, degrade,
      queue.
- [ ] Partial failure of a multi step operation leaves a consistent state.
- [ ] The user sees something truthful when the dependency is down.
- [ ] The operator can tell that it happened.

## Data and transactions

- [ ] The transaction boundary is drawn deliberately, not by accident.
- [ ] No external network call happens inside a database transaction.
- [ ] Operations that must be atomic are in one transaction, and the rest are
      not.
- [ ] Idempotency is provided where a retry can duplicate an effect.
- [ ] Migrations are reversible, or the irreversibility is stated.

## Size

- [ ] The chosen shape is the smallest one that satisfies a stated force.
- [ ] Each step up in complexity names the force that pays for it.
- [ ] No abstraction has a single implementation without a named second one.
- [ ] No process boundary was added where a function call would do.
- [ ] The reversal cost of the decision is written down.
