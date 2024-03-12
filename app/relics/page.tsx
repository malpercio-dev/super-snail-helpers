"use client";
import { useCallback, useEffect, useMemo, useState } from "react";

import { Relic } from "@/db/schema";
import { useSession } from "next-auth/react";
import {
  Button,
  Dropdown,
  DropdownItem,
  DropdownMenu,
  DropdownTrigger,
  Input,
  Link,
  Pagination,
  Selection,
  Table,
  TableBody,
  TableCell,
  TableColumn,
  TableHeader,
  TableRow,
  User,
  getKeyValue,
} from "@nextui-org/react";
import { useAsyncList } from "@react-stately/data";
import { IconSvgProps } from "@/types";

const gradeOptions = [
  {
    grade: "green",
  },
  {
    grade: "blue",
  },
  {
    grade: "a",
  },
  {
    grade: "aa",
  },
  {
    grade: "aaa",
  },
  {
    grade: "s",
  },
  {
    grade: "ss",
  },
  {
    grade: "sss",
  },
];

const affctOptions = [
  {
    affct: "art",
  },
  {
    affct: "fame",
  },
  {
    affct: "faith",
  },
  {
    affct: "civ",
  },
  {
    affct: "tech",
  },
];

const SearchIcon = (props: IconSvgProps) => (
  <svg
    aria-hidden="true"
    fill="none"
    focusable="false"
    height="1em"
    role="presentation"
    viewBox="0 0 24 24"
    width="1em"
    {...props}
  >
    <path
      d="M11.5 21C16.7467 21 21 16.7467 21 11.5C21 6.25329 16.7467 2 11.5 2C6.25329 2 2 6.25329 2 11.5C2 16.7467 6.25329 21 11.5 21Z"
      stroke="currentColor"
      strokeLinecap="round"
      strokeLinejoin="round"
      strokeWidth="2"
    />
    <path
      d="M22 22L20 20"
      stroke="currentColor"
      strokeLinecap="round"
      strokeLinejoin="round"
      strokeWidth="2"
    />
  </svg>
);

const ChevronDownIcon = ({
  strokeWidth = 1.5,
  ...otherProps
}: IconSvgProps) => (
  <svg
    aria-hidden="true"
    fill="none"
    focusable="false"
    height="1em"
    role="presentation"
    viewBox="0 0 24 24"
    width="1em"
    {...otherProps}
  >
    <path
      d="m19.92 8.95-6.52 6.52c-.77.77-2.03.77-2.8 0L4.08 8.95"
      stroke="currentColor"
      strokeLinecap="round"
      strokeLinejoin="round"
      strokeMiterlimit={10}
      strokeWidth={strokeWidth}
    />
  </svg>
);

interface MyRelic extends Relic {
  [key: string]: number | string | null | undefined;
}

export default function Relics() {
  const [isLoading, setIsLoading] = useState(true);

  const relics = useAsyncList<MyRelic>({
    async load({ signal }) {
      const res = await fetch("/api/relics", {
        signal,
      });
      const json = await res.json();
      setIsLoading(false);
      return {
        items: json,
      };
    },
    async sort({ items, sortDescriptor }) {
      return {
        items: items.sort((a, b) => {
          const first = a[sortDescriptor.column!];
          const second = b[sortDescriptor.column!];
          let cmp =
            (first ? parseInt(first.toString()) || first : 0) <
            (second ? parseInt(second.toString()) || second : 0)
              ? -1
              : 1;

          if (sortDescriptor.direction === "descending") {
            cmp *= -1;
          }
          return cmp;
        }),
      };
    },
  });

  const [gradeFilter, setGradeFilter] = useState<Selection>("all");
  const [affctFilter, setAffctFilter] = useState<Selection>("all");
  const [filterValue, setFilterValue] = useState("");
  const hasSearchFilter = Boolean(filterValue);

  const filteredItems = useMemo(() => {
    let filteredRelics = [...relics.items];

    if (hasSearchFilter) {
      filteredRelics = filteredRelics.filter((relic) =>
        relic.name.toLowerCase().includes(filterValue.toLowerCase())
      );
    }
    if (
      gradeFilter !== "all" &&
      Array.from(gradeFilter).length !== gradeOptions.length
    ) {
      filteredRelics = filteredRelics.filter((relic) =>
        Array.from(gradeFilter).includes(relic.grade)
      );
    }
    if (
      affctFilter !== "all" &&
      Array.from(affctFilter).length !== affctOptions.length
    ) {
      filteredRelics = filteredRelics.filter((relic) =>
        Array.from(affctFilter).includes(relic.affct)
      );
    }

    return filteredRelics;
  }, [relics, filterValue, gradeFilter, affctFilter]);

  const [page, setPage] = useState(1);
  const rowsPerPage = 25;
  const pages = Math.ceil(filteredItems.length / rowsPerPage);
  const items = useMemo(() => {
    const start = (page - 1) * rowsPerPage;
    const end = start + rowsPerPage;
    return filteredItems.slice(start, end);
  }, [page, filteredItems, rowsPerPage]);

  const onSearchChange = useCallback((value?: string) => {
    if (value) {
      setFilterValue(value);
      setPage(1);
    } else {
      setFilterValue("");
    }
  }, []);

  const onClear = useCallback(() => {
    setFilterValue("");
    setPage(1);
  }, []);

  const topContent = useMemo(
    () => (
      <div className="flex flex-col gap-4">
        <div className="flex justify-between gap-3 items-end">
          <Input
            isClearable
            className="w-full sm:max-w-[44%]"
            placeholder="Search by name..."
            startContent={<SearchIcon />}
            value={filterValue}
            onClear={() => onClear()}
            onValueChange={onSearchChange}
          />
          <div className="flex gap-3">
            <Dropdown>
              <DropdownTrigger className="hidden sm:flex">
                <Button
                  endContent={<ChevronDownIcon className="text-small" />}
                  variant="flat"
                >
                  Grade
                </Button>
              </DropdownTrigger>
              <DropdownMenu
                disallowEmptySelection
                aria-label="Table Columns"
                closeOnSelect={false}
                selectedKeys={gradeFilter}
                selectionMode="multiple"
                onSelectionChange={setGradeFilter}
              >
                {gradeOptions.map((grade) => (
                  <DropdownItem key={grade.grade}>{grade.grade}</DropdownItem>
                ))}
              </DropdownMenu>
            </Dropdown>
            <Dropdown>
              <DropdownTrigger className="hidden sm:flex">
                <Button
                  endContent={<ChevronDownIcon className="text-small" />}
                  variant="flat"
                >
                  AFFCT
                </Button>
              </DropdownTrigger>
              <DropdownMenu
                disallowEmptySelection
                aria-label="Table Columns"
                closeOnSelect={false}
                selectedKeys={affctFilter}
                selectionMode="multiple"
                onSelectionChange={setAffctFilter}
              >
                {affctOptions.map((affct) => (
                  <DropdownItem key={affct.affct}>{affct.affct}</DropdownItem>
                ))}
              </DropdownMenu>
            </Dropdown>
          </div>
        </div>
      </div>
    ),
    [filterValue, gradeFilter, affctFilter, onSearchChange, hasSearchFilter]
  );

  const bottomContent = useMemo(
    () => (
      <div className="flex w-full justify-center">
        <Pagination
          isCompact
          showControls
          showShadow
          color="secondary"
          page={page}
          total={pages}
          onChange={(page) => setPage(page)}
        />
      </div>
    ),
    [page, pages]
  );

  if (isLoading) {
    return <div>Loading...</div>;
  }

  return (
    <Table
      aria-label="Relics"
      isHeaderSticky
      sortDescriptor={relics.sortDescriptor}
      onSortChange={relics.sort}
      topContent={topContent}
      bottomContent={bottomContent}
      classNames={{
        wrapper: "min-h-[222px]",
      }}
    >
      <TableHeader>
        {/* {Object.keys(items[0]).filter(k => k !== 'id').map((key) => (
          <TableColumn key={key} allowsSorting>{key}</TableColumn>
        ))} */}
        <TableColumn key="name" allowsSorting>
          Name
        </TableColumn>
        <TableColumn key="grade" allowsSorting>
          Grade
        </TableColumn>
        <TableColumn key="affct" allowsSorting>
          AFFCT
        </TableColumn>
      </TableHeader>
      <TableBody items={items}>
        {(relic: Relic) => (
          <TableRow key={relic.id}>
            <TableCell>
              <User
                name={<Link href={`/relics/${relic.name}`}>{relic.name}</Link>}
                avatarProps={{
                  src: `/media/relics${relic.imagePath}`,
                  imgProps: {
                    loading: "lazy",
                  },
                }}
              />
            </TableCell>
            <TableCell>{relic.grade}</TableCell>
            <TableCell>{relic.affct}</TableCell>
          </TableRow>
        )}
      </TableBody>
    </Table>
  );
}
