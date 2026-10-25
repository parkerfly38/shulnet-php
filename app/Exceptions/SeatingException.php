<?php

namespace App\Exceptions;

use RuntimeException;

/**
 * A seat request that cannot be fulfilled; the message is safe to show to the user.
 */
class SeatingException extends RuntimeException {}
