from pathlib import Path
here = Path().resolve()
print(here, (here / "experiments").exists(), list(here.iterdir()))

import psiturk.experiment_server as exp
exp.launch()
